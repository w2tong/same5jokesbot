import schedule from 'node-schedule';
import { dateToDbString, getRandomRange } from '../../util/util';
import { Lottery, getActiveLottery, getCurrentLottery, insertLottery, updateJackpot } from '../../sql/tables/lottery';
import { getUserCringePoints, updateCringePoints } from '../../sql/tables/cringe-points';
import { JackpotWinner, LotteryTicket, getJackpotWinners, getUnclaimedUsers, getUserLotteryTickets, insertLotteryTicket, claimLotteryTickets, getUnclaimedUserTicketsCount } from '../../sql/tables/lottery-ticket';
import { ChannelType, Client, EmbedBuilder, User, UserManager, bold, time } from 'discord.js';
import { emptyEmbedField, fetchChannel, fetchUser, messageEmbedLimit } from '../../util/discordUtil';

const numbers = Array.from(new Array(10), (_x, i) => i+1);
const choose = 3;
const price = 10000;
const basePayout = 0.25;
const payoutMultiplier = 4;
const payout: {[key: number]: number} = {0: 0};
for (let i = 1; i <= choose; i++) {
    payout[i] = price*basePayout*(payoutMultiplier**(i-1));
}
const startTime = 0;
const lotteryLengthHours = 21;
const ticketLimit = 3;

function generateNumbers() {
    const choices = numbers.slice();
    const nums = [];
    for (let i = 0; i < choose; i++) {
        nums.push(choices.splice(getRandomRange(choices.length), 1)[0]);
    }
    return nums.sort((a,b) => a-b).join(',');
}

function scheduleNewLotteryCronJob(client: Client) {
    schedule.scheduleJob({ second: 0, minute: 0, hour: startTime, tz: 'America/Toronto' }, async function() {
        const lottery = await getCurrentLottery();
        if (!process.env.CASINO_CHANNEL_ID) return;
        const channel = await fetchChannel(client.channels, process.env.CASINO_CHANNEL_ID);
        if (!channel || channel.type !== ChannelType.GuildText) return;

        // End current lottery
        if (lottery) {
            // Process unclaimed tickets
            const jackpotWinners = await getJackpotWinners(lottery.ID);
            const jackpotPerTicket = calcJackpotPerTicket(jackpotWinners, lottery.JACKPOT);
            const unclaimedUsers = await getUnclaimedUsers(lottery.ID);
            if (unclaimedUsers.length > 0) {
                const embedPromises = [];
                const claimLotteryTicketsUpdates = [];
                for (let i = 0; i < unclaimedUsers.length; i++) {
                    const user = await fetchUser(client.users, unclaimedUsers[i][0]);
                    if (!user) continue;
                    const tickets = await getUserLotteryTickets(user.id, lottery.ID);
                    if (!tickets) continue;
                    embedPromises.push((await claimTickets(user, lottery, tickets, jackpotPerTicket)).embed);
                    claimLotteryTicketsUpdates.push({lotteryId: lottery.ID, userId: user.id});
                }
                // Send embeds of unclaimed tickets
                const embeds = (await Promise.all(embedPromises));
                await claimLotteryTickets(claimLotteryTicketsUpdates);
                for (let i = 0; i < embeds.length; i += messageEmbedLimit) {
                    await channel.send({embeds: embeds.slice(i, i+messageEmbedLimit)});
                }
            }
            // Send jackpot results
            await channel.send({embeds: [await createLotteryResultsEmbed(lottery, jackpotWinners, jackpotPerTicket, client.users)]});
        }

        // Create new lottery
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + lotteryLengthHours);
        const houseBalance = process.env.CLIENT_ID ? await getUserCringePoints(process.env.CLIENT_ID) ?? 0 : 0;
        const newJackpot = houseBalance >= 0 ? houseBalance : 0;
        await insertLottery(dateToDbString(startDate), dateToDbString(endDate), generateNumbers(), newJackpot);
        await channel.send({embeds: [createNewLotteryEmbed(startDate, endDate, newJackpot)]});
    });
}

function scheduleEndLotteryCronJob(client: Client) {
    schedule.scheduleJob({ second: 0, minute: 0, hour: startTime + lotteryLengthHours, tz: 'America/Toronto' }, async function() {
        const lottery = await getCurrentLottery();
        if (!process.env.CASINO_CHANNEL_ID) return;
        const channel = await fetchChannel(client.channels, process.env.CASINO_CHANNEL_ID);
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

async function buyTicket(userId: string, numbers: Array<number>): Promise<{success: boolean, res: string}> {
    const lottery = await getActiveLottery();
    if (!lottery) return {success: false, res: 'There isn\'t an active lottery.'};

    if ((await getUserLotteryTickets(userId, lottery.ID)).length >= ticketLimit) {
        return {success: false, res: `You have reached the limit of tickets that you can buy (max: ${ticketLimit})`};
    }

    const points = await getUserCringePoints(userId) ?? 0;
    if (points < price) {
        return {success: false, res: `You do not have enough points (${price}).`};
    }

    for (let i = 0; i < numbers.length-1; i++) {
        if (numbers[i] === numbers[i+1]) {
            return {success: false, res: 'You cannot have duplicate numbers.'};
        }
    }

    await updateCringePoints([{userId, points: -price}]);
    if (process.env.CLIENT_ID) await updateCringePoints([{userId: process.env.CLIENT_ID, points: price}]);
    await updateJackpot(lottery.ID, price);
    await insertLotteryTicket(lottery.ID, userId, numbers.join(','));
    return {success: true, res: `You bought a lottery ticket with the numbers: ${bold(numbers.join(', '))}.`};
}

async function checkTickets(userId: string, users: UserManager): Promise<{reply: {content: string, embeds: Array<EmbedBuilder>}, winnings: number}> {
    const user = await fetchUser(users, userId);

    const lottery = await getCurrentLottery();
    if (!lottery) return {reply: {content: 'There is currently no lottery', embeds: []}, winnings: 0};

    const activeLottery = await getActiveLottery();
    if (activeLottery) return {reply: {content: 'You cannot check your ticket when the lottery is active.', embeds: []}, winnings: 0};

    const tickets = await getUserLotteryTickets(userId, lottery.ID);
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
async function claimTickets(user: User, lottery: Lottery, tickets: Array<LotteryTicket>, jackpot: number): Promise<{embed: EmbedBuilder, winnings: number}> {
    let totalWinnings = 0;
    const ticketWinnings: Array<TicketWinnings> = [];
    const lotteryNumbers = lottery.NUMBERS.split(',');
    for (let i = 0; i < tickets.length; i++) {
        const ticketNumbers = tickets[i].NUMBERS.split(',');
        const winningNumbers = lotteryNumbers.filter(element => ticketNumbers.includes(element));
        const winnings = payout[winningNumbers.length];
        const jackpotWinnings = lottery.NUMBERS === tickets[i].NUMBERS ? jackpot : 0;
        ticketWinnings.push({numbers: tickets[i].NUMBERS, winnings, jackpotWinnings });
        totalWinnings += winnings;
    }
    await updateCringePoints([{userId: user.id, points: totalWinnings}]);
    if (process.env.CLIENT_ID) await updateCringePoints([{userId: process.env.CLIENT_ID, points: -totalWinnings}]);
    return {embed: createUserTicketsEmbed(user.username, totalWinnings, ticketWinnings), winnings: totalWinnings};
}

function calcJackpotPerTicket(winners: Array<JackpotWinner>, jackpot: number) {
    if (jackpot === 0) return 0;
    const totalTickets = winners.reduce((total, user) => total + user.COUNT, 0);
    return totalTickets > 0 ? Math.ceil(jackpot/totalTickets) : jackpot;
}

function createUserTicketsEmbed(username: string, totalWinnings: number, ticketWinnings: Array<TicketWinnings>): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setTitle(`${username}'s Lottery Winnings`)
        .addFields({name: 'Total Winnings', value: `${totalWinnings.toLocaleString()}`});
    for (let i = 0; i < ticketWinnings.length; i++) {
        embed.addFields(
            {name: `Ticket ${i+1}`, value: `${ticketWinnings[i].numbers.split(',').join(', ')}`, inline: true},
            {name: `Winnings ${ticketWinnings[i].jackpotWinnings > 0 ? '(JACKPOT)' : ''}`, value: `${ticketWinnings[i].winnings.toLocaleString()} ${ticketWinnings[i].jackpotWinnings > 0 ? `(+${ticketWinnings[i].jackpotWinnings})` : ''}`, inline: true},
            emptyEmbedField
        );
    }
    return embed;
}

async function createLotteryResultsEmbed(lottery: Lottery, winners: Array<JackpotWinner>, jackpotPerTicket: number, users: UserManager): Promise<EmbedBuilder> {
    const winnersFieldValue = (await Promise.all(winners.map(async winner => {
        const user = await fetchUser(users, winner.USER_ID);
        return `${user.username ?? winner.USER_ID} (+${(jackpotPerTicket*winner.COUNT).toLocaleString()})`;
    }))).join('\n');
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

export default {
    numbers,
    choose,
    price,
    ticketLimit,
    buyTicket,
    checkTickets,
};
export {
    scheduleNewLotteryCronJob,
    scheduleEndLotteryCronJob
};