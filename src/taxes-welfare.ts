import { Client, EmbedBuilder, MessageCreateOptions, time, userMention } from 'discord.js';
import schedule from 'node-schedule';
import { CringePointsUpdate, getAllUserCringePoints, updateCringePoints } from './sql/tables/cringe-points';
import { emptyEmbedField, fetchChannel } from './util/discordUtil';

const dailyTaxBracket: {[key: number]: number} = {
    0: 0,
    100_000: 0,
    250_000: 0.01,
    500_000: 0.02,
    1_000_000: 0.03,
    2_500_000: 0.04,
    5_000_000: 0.05,
    10_000_000: 0.06,
    25_000_000: 0.07,
    50_000_000: 0.08,
    100_000_000: 0.09,
    250_000_000: 0.10,
    500_000_000: 0.11,
    1_000_000_000: 0.12,
};
const taxBrackets = Object.keys(dailyTaxBracket).map(bracket => parseInt(bracket));
const welfareLimit = taxBrackets[1];
const welfarePoolPc = 0.5;

function calculateDailyTax(points: number) {
    if (points <= 0) return 0;
    let taxes = 0;
    for (let i = 1; i < taxBrackets.length; i++) {
        if (points <= taxBrackets[i]) {
            taxes += (points - taxBrackets[i-1]) * dailyTaxBracket[taxBrackets[i]];
            break;
        }
        taxes += (taxBrackets[i] - taxBrackets[i-1]) * dailyTaxBracket[taxBrackets[i]];
    }
    return Math.floor(taxes);
}

function createTaxesResponse(taxesTotal: number, userIds: string[], balances: string[], newBalances: string[]): MessageCreateOptions {
    if (userIds.length === 0 || balances.length === 0 || newBalances.length === 0) return {content: 'No taxes today.'};
    const embed = new EmbedBuilder()
        .setTitle(`${time(new Date(), 'd')} Taxes`)
        .addFields(
            emptyEmbedField,
            emptyEmbedField,
            {name: 'Taxes Total', value: taxesTotal.toLocaleString(), inline: true},
            {name: 'User', value: userIds.map(id => userMention(id)).join('\n'), inline: true},
            {name: 'Balance', value: balances.join('\n'), inline: true},
            {name: 'New Balance', value: newBalances.join('\n'), inline: true}
        );
    return {embeds: [embed]};
}

function createWelfareResponse(welfareTotal: number, userIds: string[], balances: string[], newBalances: string[]): MessageCreateOptions {
    if (userIds.length === 0 || balances.length === 0 || newBalances.length === 0) return {content: 'No welfare today.'};
    const embed = new EmbedBuilder()
        .setTitle(`${time(new Date(), 'd')} Welfare`)
        .addFields(
            emptyEmbedField,
            emptyEmbedField,
            {name: 'Welfare Total', value: welfareTotal.toLocaleString(), inline: true},
            {name: 'User', value: userIds.map(id => userMention(id)).join('\n'), inline: true},
            {name: 'Balance', value: balances.join('\n'), inline: true},
            {name: 'New Balance', value: newBalances.join('\n'), inline: true}
        );
    return {embeds: [embed]};
}

// Daily tax/welfare
function scheduleDailyTaxWelfareCronJob(client: Client) {
    schedule.scheduleJob({ second: 0, minute: 5, hour: 0, tz: 'America/Toronto' }, async function() {
        if (!process.env.CLIENT_ID) return;

        // Calculate taxes
        let userCringePoints = await getAllUserCringePoints();
        const taxUserIds: string[] = [];
        const taxesBalances: string[] = [];
        const taxesNewBalances: string[] = [];
        const taxUpdates: CringePointsUpdate[] = [];
        let taxesTotal = 0;
        for (let i = 0; i < userCringePoints.length; i++) {
            const {USER_ID, POINTS} = userCringePoints[i];
            if (USER_ID === process.env.CLIENT_ID) continue;
            const tax = calculateDailyTax(POINTS);
            if (tax > 0) {
                taxUpdates.push({userId: USER_ID, points: -tax});
                taxUpdates.push({userId: process.env.CLIENT_ID, points: tax});
                taxUserIds.push(USER_ID);
                taxesBalances.push(`${POINTS.toLocaleString()} (${(-tax).toLocaleString()})`);
                taxesNewBalances.push(`${(POINTS-tax).toLocaleString()}`);
            }
            taxesTotal += tax;
        }
        // Update user points with taxes
        await updateCringePoints(taxUpdates);
        if (process.env.CASINO_CHANNEL_ID) {
            const channel = await fetchChannel(client.channels, process.env.CASINO_CHANNEL_ID);
            if (channel?.isTextBased()) await channel.send(createTaxesResponse(taxesTotal, taxUserIds, taxesBalances, taxesNewBalances));
        }

        // Calculate welfare
        userCringePoints = await getAllUserCringePoints();
        const welfareUpdates: CringePointsUpdate[] = [];
        const welfareUserIds: string[] = [];
        const welfareBalances: string[] = [];
        const welfareNewBalances: string[] = [];
        let welfarePool = taxesTotal * welfarePoolPc;
        let welfare = 0;
        let welfareTotal = 0;
        for (let i = 0; i < userCringePoints.length; i++) {
            const {USER_ID, POINTS} = userCringePoints[i];
            if (POINTS >= welfareLimit) continue;
            const welfarePerUser = Math.floor(welfarePool / (userCringePoints.length - i));
            if (POINTS + welfarePerUser > welfareLimit) {
                welfare = welfareLimit - POINTS;
            }
            else {
                welfare = welfarePerUser;
            }
            welfareUpdates.push({userId: process.env.CLIENT_ID, points: -welfare});
            welfareUpdates.push({userId: USER_ID, points: welfare});
            welfarePool -= welfare;
            welfareTotal += welfare;
            welfareUserIds.push(USER_ID);
            welfareBalances.push(`${POINTS.toLocaleString()} (+${(welfare).toLocaleString()})`);
            welfareNewBalances.push(`${(POINTS + welfare).toLocaleString()}`);
        }
        // Update user points with welfare
        void updateCringePoints(welfareUpdates);
        if (process.env.CASINO_CHANNEL_ID) {
            const channel = await fetchChannel(client.channels, process.env.CASINO_CHANNEL_ID);
            if (channel?.isTextBased()) await channel.send(createWelfareResponse(welfareTotal, welfareUserIds, welfareBalances, welfareNewBalances));
        }
    });
}

export { dailyTaxBracket, calculateDailyTax, scheduleDailyTaxWelfareCronJob };