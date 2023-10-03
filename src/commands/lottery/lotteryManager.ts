import schedule from 'node-schedule';
import { dateToDbString, getRandomRange, timeInMS } from '../../util/util';
import { Lottery, getActiveLottery, getCurrentLottery, insertLottery, updateJackpot } from '../../sql/tables/lottery';
import { getUserCringePoints, houseUserTransfer } from '../../sql/tables/cringe_points';
import { JackpotWinner, LotteryTicket, getJackpotWinners, getUnclaimedUsers, getUserLotteryTickets, insertLotteryTicket, claimLotteryTickets, getUnclaimedUserTicketsCount } from '../../sql/tables/lottery_ticket';
import { ChannelType, Client, EmbedBuilder, User, bold, roleMention, time, userMention } from 'discord.js';
import { emptyEmbedFieldInline, fetchChannel, fetchUser, header, MessageEmbedLimit } from '../../util/discordUtil';
import { ProfitType, updateProfits } from '../../sql/tables/profits';
import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';
import { getAllLotteryAutoBuy } from '../../sql/tables/lottery_auto_buy';

type LotteryEvents = {
    buy: (user: User, tickets: number, client: Client, channelId: string) => Promise<void>
    check: (user: User, winnings: number, channelId: string) => Promise<void> // unused
  }
const lotteryEmitter = new EventEmitter() as TypedEmitter<LotteryEvents>;

const numbers = Array.from(new Array(12), (_x, i) => i+1);
const choose = 3;
const price = 10000;
const basePayout = 0.25;
const payoutMultiplier = 4;
const payout: {[key: number]: number} = {0: 0};
for (let i = 1; i <= choose; i++) {
    payout[i] = price*basePayout*(payoutMultiplier**(i-1));
}
const startTime = 0;
let lotteryLengthHours = 21;
const ticketLimit = 10;

let startCronJobTime: string | schedule.RecurrenceSpecObjLit = { second: 0, minute: 0, hour: startTime, tz: 'America/Toronto' };
let endCronJobTime: string | schedule.RecurrenceSpecObjLit = { second: 0, minute: 0, hour: startTime + lotteryLengthHours, tz: 'America/Toronto' };
let autoBuyCronJobTime: string | schedule.RecurrenceSpecObjLit = { second: 30, minute: 0, hour: startTime, tz: 'America/Toronto' };
if (process.env.NODE_ENV === 'development') {
    startCronJobTime = '*/2 * * * *';
    endCronJobTime = '1-59/2 * * * *';
    autoBuyCronJobTime = '10 */2 * * * *';
    lotteryLengthHours = 1/60;
}

function generateNumbersArray() {
    const choices = numbers.slice();
    const nums = [];
    for (let i = 0; i < choose; i++) {
        nums.push(choices.splice(getRandomRange(choices.length), 1)[0]);
    }
    return nums.sort((a,b) => a-b);
}

function scheduleNewLotteryCronJob(client: Client) {
    schedule.scheduleJob(startCronJobTime, async function() {
        const lottery = await getCurrentLottery();
        if (!process.env.CASINO_CHANNEL_ID) return;
        const channel = await fetchChannel(client, process.env.CASINO_CHANNEL_ID);
        if (!channel || channel.type !== ChannelType.GuildText) return;

        // End current lottery
        let jackpotWinners = [];
        if (lottery) {
            // Process unclaimed tickets
            jackpotWinners = await getJackpotWinners(lottery.ID);
            const jackpotPerTicket = calcJackpotPerTicket(jackpotWinners, lottery.JACKPOT);
            const unclaimedUsers = await getUnclaimedUsers(lottery.ID);
            if (unclaimedUsers.length > 0) {
                const embedPromises = [];
                const claimLotteryTicketsUpdates = [];
                for (let i = 0; i < unclaimedUsers.length; i++) {
                    const user = await fetchUser(client, unclaimedUsers[i][0]);
                    if (!user) continue;
                    const tickets = await getUserLotteryTickets(user.id, lottery.ID);
                    if (!tickets) continue;
                    embedPromises.push((await claimTickets(user, lottery, tickets, jackpotPerTicket)).embed);
                    claimLotteryTicketsUpdates.push({lotteryId: lottery.ID, userId: user.id});
                }
                // Send embeds of unclaimed tickets
                const embeds = (await Promise.all(embedPromises));
                await claimLotteryTickets(claimLotteryTicketsUpdates);
                for (let i = 0; i < embeds.length; i += MessageEmbedLimit) {
                    await channel.send({embeds: embeds.slice(i, i+MessageEmbedLimit)});
                }
            }
            // Send jackpot results
            await channel.send({embeds: [createLotteryResultsEmbed(lottery, jackpotWinners, jackpotPerTicket)]});
        }

        // Create new lottery
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + Math.round(timeInMS.hour * lotteryLengthHours));
        const houseBalance = process.env.CLIENT_ID ? await getUserCringePoints(process.env.CLIENT_ID) ?? 0 : 0;
        const newJackpot = Math.max(
            numbers.length * 250_000,
            jackpotWinners.length > 0 ? 0 : lottery?.JACKPOT ?? 0, 
            houseBalance * 0.5
        );
        await insertLottery(dateToDbString(startDate), dateToDbString(endDate), generateNumbersArray().join(','), newJackpot);
        
        await channel.send({content: `${process.env.LOTTERY_ROLE_ID ? `${roleMention(process.env.LOTTERY_ROLE_ID)}` : ''}`, embeds: [createNewLotteryEmbed(startDate, endDate, newJackpot)]});
    });
}

function scheduleEndLotteryCronJob(client: Client) {
    schedule.scheduleJob(endCronJobTime, async function() {
        const lottery = await getCurrentLottery();
        if (!process.env.CASINO_CHANNEL_ID) return;
        const channel = await fetchChannel(client, process.env.CASINO_CHANNEL_ID);
        if (!channel || channel.type !== ChannelType.GuildText) return;

        if (lottery) {
            const embed = new EmbedBuilder()
                .setTitle(`${time(new Date(lottery.START_DATE), 'd')} Lottery Ended`)
                .addFields(
                    {name: 'Jackpot', value: `${lottery.JACKPOT.toLocaleString()}`, inline: true},
                    {name: 'Winning Numbers', value: lottery.NUMBERS.split(',').join(', '), inline: true},
                );
            await channel.send({embeds: [embed]});
        }
    });
}

function scheduleLotteryAutoBuyCronJob(client: Client) {
    schedule.scheduleJob(autoBuyCronJobTime, async function() {
        if (!process.env.CASINO_CHANNEL_ID) return;
        const channel = await fetchChannel(client, process.env.CASINO_CHANNEL_ID);
        if (!channel || channel.type !== ChannelType.GuildText) return;

        const users = await Promise.all((await getAllLotteryAutoBuy()).map(async userId => fetchUser(client, userId)));
        const msgs = (
            await Promise.all(users.map(async user => {
                const ticketsBought = (await buyAuto(user, ticketLimit, client, channel.id)).ticketsBought;
                return (ticketsBought > 0) ? `${user} bought ${ticketsBought} lottery ticket${ticketsBought > 1  ? 's' : ''}.` : '';
            }))
        ).filter(msg => msg.length !== 0);
        if (msgs.length > 0) await channel.send(`${header('Lottery Auto Buy', 2)}\n${msgs.join('\n')}`);
    });
}

async function buyTicket(user: User, numbers: number[], client: Client, channelId: string): Promise<{success: boolean, res: string}> {
    const lottery = await getActiveLottery();
    if (!lottery) return {success: false, res: 'There isn\'t an active lottery.'};

    if ((await getUserLotteryTickets(user.id, lottery.ID)).length >= ticketLimit) {
        return {success: false, res: `You have reached the limit of tickets that you can buy (max: ${ticketLimit})`};
    }

    const points = await getUserCringePoints(user.id) ?? 0;
    if (points < price) {
        return {success: false, res: `You do not have enough points (${price}).`};
    }

    for (let i = 0; i < numbers.length-1; i++) {
        if (numbers[i] === numbers[i+1]) {
            return {success: false, res: 'You cannot have duplicate numbers.'};
        }
    }

    await houseUserTransfer([{userId: user.id, points: -price}]);
    await updateProfits([{userId: user.id, type: ProfitType.Lottery, profit: -price}]);
    await updateJackpot(lottery.ID, price * 0.5);
    await insertLotteryTicket(lottery.ID, user.id, numbers.join(','));

    lotteryEmitter.emit('buy', user, 1, client, channelId);

    return {success: true, res: `You bought a lottery ticket with the numbers: ${bold(numbers.join(', '))}.`};
}

async function buyAuto(user: User, ticketsToBuy: number, client: Client, channelId: string) {
    let ticketsBought = 0;
    const msgs = [];

    while (ticketsBought < ticketsToBuy) {
        const {success, res} = await buyTicket(user, generateNumbersArray(), client, channelId);
        msgs.push(res);
        if (!success) break;
        ticketsBought++;
    }

    return {msg: msgs.join('\n'), ticketsBought};
}

async function checkTickets(user: User): Promise<{reply: {content: string, embeds: EmbedBuilder[]}, winnings: number}> {

    const lottery = await getCurrentLottery();
    if (!lottery) return {reply: {content: 'There is currently no lottery', embeds: []}, winnings: 0};

    const activeLottery = await getActiveLottery();
    if (activeLottery) return {reply: {content: 'You cannot check your ticket when the lottery is active.', embeds: []}, winnings: 0};

    const tickets = await getUserLotteryTickets(user.id, lottery.ID);
    if (tickets.length === 0) return {reply: {content: 'You did not buy any tickets for the current lottery.', embeds: []}, winnings: 0};

    const unclaimedTickets = await getUnclaimedUserTicketsCount(lottery.ID, user.id);
    if (unclaimedTickets === 0) return {reply: {content: 'You have already claimed your tickets for this lottery.', embeds: []}, winnings: 0};

    const jackpotWinners = await getJackpotWinners(lottery.ID);
    const jackpot = calcJackpotPerTicket(jackpotWinners, lottery.JACKPOT);
    const {embed, winnings} = await claimTickets(user, lottery, tickets, jackpot);
    await claimLotteryTickets([{lotteryId: lottery.ID, userId: user.id}]);
    return {reply: {content: '', embeds: [embed]}, winnings};
}

type TicketWinnings = {numbers: string, winnings: number, jackpotWinnings: number};
async function claimTickets(user: User, lottery: Lottery, tickets: LotteryTicket[], jackpot: number): Promise<{embed: EmbedBuilder, winnings: number}> {
    let totalWinnings = 0;
    const ticketWinnings: TicketWinnings[] = [];
    const lotteryNumbers = lottery.NUMBERS.split(',');
    for (let i = 0; i < tickets.length; i++) {
        const ticketNumbers = tickets[i].NUMBERS.split(',');
        const winningNumbers = lotteryNumbers.filter(element => ticketNumbers.includes(element));
        const winnings = payout[winningNumbers.length];
        const jackpotWinnings = lottery.NUMBERS === tickets[i].NUMBERS ? jackpot : 0;
        ticketWinnings.push({numbers: tickets[i].NUMBERS, winnings, jackpotWinnings });
        totalWinnings += winnings + jackpotWinnings;
    }
    if (totalWinnings > 0) await houseUserTransfer([{userId: user.id, points: totalWinnings}]);
    await updateProfits([{userId: user.id, type: ProfitType.Lottery, profit: totalWinnings}]);
    return {embed: createUserTicketsEmbed(user, totalWinnings, ticketWinnings), winnings: totalWinnings};
}

function calcJackpotPerTicket(winners: JackpotWinner[], jackpot: number) {
    if (jackpot === 0) return 0;
    const totalTickets = winners.reduce((total, user) => total + user.COUNT, 0);
    return totalTickets > 0 ? Math.ceil(jackpot/totalTickets) : jackpot;
}

function createUserTicketsEmbed(user: User, totalWinnings: number, ticketWinnings: TicketWinnings[]): EmbedBuilder {
    let jackpot = false;
    const tickets = [];
    const winnings = [];
    
    for (let i = 0; i < ticketWinnings.length; i++) {
        if (ticketWinnings[i].jackpotWinnings > 0) jackpot = true;
        tickets.push(`${ticketWinnings[i].numbers.split(',').join(', ')}`);
        winnings.push(`${ticketWinnings[i].winnings.toLocaleString()} ${ticketWinnings[i].jackpotWinnings > 0 ? `(+${ticketWinnings[i].jackpotWinnings.toLocaleString()})` : ''}`);
    }

    const embed = new EmbedBuilder()
        .setAuthor({name: `${user.username}'s Lottery Winnings ${jackpot ? '(JACKPOT)' : ''}`, iconURL: user.displayAvatarURL()})
        .addFields(
            emptyEmbedFieldInline,
            emptyEmbedFieldInline,
            {name: 'Total Winnings', value: `${totalWinnings.toLocaleString()}`, inline: true},

            {name: 'Tickets', value: tickets.join('\n'), inline: true},
            emptyEmbedFieldInline,
            {name: 'Winnings', value: winnings.join('\n'), inline: true},
        );

    return embed;
}

function createLotteryResultsEmbed(lottery: Lottery, winners: JackpotWinner[], jackpotPerTicket: number): EmbedBuilder {
    const winnersFieldValue = winners.map(winner => {
        return `${userMention(winner.USER_ID)} (+${(jackpotPerTicket*winner.COUNT).toLocaleString()})`;
    }).join('\n');
    return new EmbedBuilder()
        .setTitle(`${time(new Date(`${lottery.START_DATE} UTC`), 'd')} Lottery Results`)
        .addFields(
            {name: 'Jackpot', value: `${lottery.JACKPOT.toLocaleString()}`, inline: true},
            {name: 'Winning Numbers', value: lottery.NUMBERS.split(',').join(', '), inline: true},
            {name: 'Jackpot Winners', value: winners.length > 0 ? winnersFieldValue : 'None'}
        );
}

function createNewLotteryEmbed(startDate: Date, endDate: Date, jackpot: number): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle(`${time(startDate, 'd')} Lottery Started`)
        .addFields(
            {name: 'Jackpot', value: `${jackpot.toLocaleString()}`, inline: true},
            {name: 'End Time', value: time(endDate, 'R'), inline: true},
        );
}

async function createLotteryInfoEmbed(): Promise<EmbedBuilder> {
    const lottery = await getCurrentLottery();
    const numOfNums = [];
    const payouts = [];
    for (let i = 1; i <= choose; i++) {
        numOfNums.push(i);
        payouts.push(payout[i].toLocaleString());
    }
    const embed = new EmbedBuilder()
        .setTitle('Lottery Info')
        .addFields(
            {name: 'Numbers', value: `${numbers[0]} - ${numbers[numbers.length-1]}`, inline: true},
            {name: 'Choose', value: `${choose}`, inline: true},
            {name: 'Current Jackpot', value: `${lottery?.JACKPOT.toLocaleString() ?? 'None'}`, inline: true},

            {name: '# of nums', value: `${numOfNums.join('\n')}`, inline: true},
            emptyEmbedFieldInline,
            {name: 'Payout', value: `${payouts.join('\n')}${lottery ? ` + ${lottery.JACKPOT.toLocaleString()}` : ''}`, inline: true},
        );
    return embed;
}

export default {
    numbers,
    choose,
    price,
    ticketLimit,
    buyTicket,
    buyAuto,
    checkTickets,
    generateNumbersArray
};
export {
    scheduleNewLotteryCronJob,
    scheduleEndLotteryCronJob,
    scheduleLotteryAutoBuyCronJob,
    createLotteryInfoEmbed,
    lotteryEmitter
};