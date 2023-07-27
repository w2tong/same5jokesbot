import { Client, EmbedBuilder, MessageCreateOptions, time, userMention } from 'discord.js';
import schedule from 'node-schedule';
import { CringePointsUpdate, getUserCringePoints, updateCringePoints } from './sql/tables/cringe-points';
import { fetchChannel } from './util/discordUtil';

const dailyTaxBracket: {[key: number]: number} = {
    0: 0,
    100_000: 0,
    250_000: 0.005,
    500_000: 0.01,
    1_000_000: 0.015,
    2_500_000: 0.02,
    5_000_000: 0.025,
    10_000_000: 0.03,
    25_000_000: 0.035,
    50_000_000: 0.04,
    100_000_000: 0.045,
    250_000_000: 0.05,
    500_000_000: 0.055,
    1_000_000_000: 0.06,
};
const taxBrackets = Object.keys(dailyTaxBracket).map(bracket => parseInt(bracket));

function calculateTax(points: number) {
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

function createTaxesResponse(userIds: string[], taxes: number[]): MessageCreateOptions {
    if (userIds.length === 0 || taxes.length === 0) return {content: 'No taxes today.'};
    const embed = new EmbedBuilder()
        .setTitle(`${time(new Date(), 'd')} Taxes`)
        .addFields(
            {name: 'User', value: userIds.join('\n')},
            {name: 'Taxes', value: taxes.join('\n')}
        );
    return {embeds: [embed]};
}

// Daily tax
function scheduleDailyTaxCronJob(client: Client) {
    schedule.scheduleJob({ second: 0, minute: 0, hour: 0, tz: 'America/Toronto' }, async function() {
        if (!process.env.CLIENT_ID) return;
        const updates: CringePointsUpdate[] = [];
        const users: string[] = [];
        const taxes: number[] = [];
        for (const {bot, id} of client.users.cache.values()) {
            if (bot) continue;
            const points = await getUserCringePoints(id) ?? 0;
            if (!points) continue;
            const tax = calculateTax(points) ;
            updates.push({userId: id, points: -tax});
            updates.push({userId: process.env.CLIENT_ID, points: tax});
            users.push(userMention(id));
            taxes.push(tax);
        }
        void updateCringePoints(updates);
        if (process.env.CASINO_CHANNEL_ID) {
            const channel = await fetchChannel(client.channels, process.env.CASINO_CHANNEL_ID);
            if (channel?.isTextBased()) await channel.send(createTaxesResponse(users, taxes));
        }
        
    });
}

export { calculateTax, scheduleDailyTaxCronJob };