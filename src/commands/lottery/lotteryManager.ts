import schedule from 'node-schedule';
import { dateToDbString, getRandomRange } from '../../util/util';
import { getActiveLottery, getCurrentLottery, insertLottery } from '../../sql/tables/lottery';
import { getUserCringePoints } from '../../sql/tables/cringe-points';
import { getLotteryTickets, insertLotteryTicket } from '../../sql/tables/lottery-ticket';
import { EmbedBuilder } from 'discord.js';
import { emptyEmbedField } from '../../util/discordUtil';

const numbers = Array.from(new Array(10), (_x, i) => i+1);
const choose = 3;
const price = 10000;
const basePayout = 0.25;
const payoutMultiplier = 4;
const payout: {[key: number]: number} = {0: 0};
for (let i = 1; i <= choose; i++) {
    payout[i] = price*basePayout*payoutMultiplier**i;
}
const startTime = 0;
const endTime = 22;
const ticketLimit = 3;

function generateNumbers() {
    const choices = numbers.slice();
    const nums = [];
    for (let i = 0; i < choose; i++) {
        nums.push(choices.splice(getRandomRange(choices.length-1), 1)[0]);
    }
    return nums.sort((a,b) => a-b).join(',');
}

function scheduleCronJob() {
    // schedule.scheduleJob(`0 ${startTime} * * *`, async function() {
    schedule.scheduleJob('*/5 * * * *', async function() {
        // End current lottery


        // Create new lottery
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + 3);
        // endDate.setHours(endDate.getHours() + endTime);
        const houseBalance = process.env.CLIENT_ID ? await getUserCringePoints(process.env.CLIENT_ID) ?? 0 : 0;
        const jackpot = houseBalance >= 0 ? houseBalance : 0;
        void insertLottery(dateToDbString(startDate), dateToDbString(endDate), generateNumbers(), jackpot);
    });
}

async function buyTicket(userId: string, numbers: Array<number>): Promise<{success: boolean, res: string}> {
    const lottery = await getActiveLottery();
    if (!lottery) return {success: false, res: 'There isn\'t an active lottery.'};

    if ((await getLotteryTickets(userId, lottery.ID)).length >= ticketLimit) {
        return {success: false, res: `You have reached the limit of tickets that you can buy (max: ${ticketLimit})`};
    }

    // Check if user has enough points
    // if (points < price) {
    //     return {success: false, res: `You do not have enough points (${price}).`};
    // }

    for (let i = 0; i < numbers.length-1; i++) {
        if (numbers[i] === numbers[i+1]) {
            return {success: false, res: 'You cannot have duplicate numbers.'};
        }
    }

    await insertLotteryTicket(lottery.ID, userId, numbers.join(','));
    return {success: true, res: `You bought a lottery ticket with the numbers: ${numbers.join(', ')}.`};
}

async function checkTickets(userId: string, username: string) {
    const lottery = await getCurrentLottery();
    if (!lottery) return 'There isn\'t a current lottery';
    const activeLottery = await getActiveLottery();
    if (activeLottery) return 'You cannot check your ticket when the lottery is active.';
    const tickets = await getLotteryTickets(userId, lottery.ID);
    if (tickets.length === 0) return 'You did not buy any tickets for the current lottery.';

    let totalWinnings = 0;
    const winnings = [];
    const lotteryTicketUpdates = [];
    const lotteryNumbers = lottery.NUMBERS.split(',');
    for (let i = 0; i < tickets.length; i++) {
        const ticketNumbers = tickets[i].NUMBERS.split(',');
        const winningNumbers = lotteryNumbers.filter(element => ticketNumbers.includes(element));
        const ticketWinnings = payout[winningNumbers.length];
        winnings.push(ticketWinnings);
        // update lottery ticket to be claimed
        // lotteryTicketUpdates.push(update)
        totalWinnings += ticketWinnings;
        
    }
    const embed = new EmbedBuilder()
        .setTitle(`${username}'s Lottery Winnings`)
        .addFields({name: 'Total Winnings', value: `${totalWinnings}`});
    for (let i = 0; i < winnings.length; i++) {
        embed.addFields(
            {name: `Ticket ${i+1}`, value: `${tickets[i].NUMBERS}`, inline: true},
            {name: 'Winnings', value: `${winnings[i]}`, inline: true},
            emptyEmbedField
        );
    }
    return embed;
}

export default {
    numbers,
    choose,
    ticketLimit,
    buyTicket,
    checkTickets,
    scheduleCronJob
};