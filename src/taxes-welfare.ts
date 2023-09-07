import { Client, EmbedBuilder, MessageCreateOptions, time, userMention } from 'discord.js';
import schedule from 'node-schedule';
import { CringePointsUpdate, getAllUserCringePoints, houseUserTransfer } from './sql/tables/cringe-points';
import { MessageEmbedLimit, UsersPerEmbed, emptyEmbedFieldInline, fetchChannel } from './util/discordUtil';
import { ProfitType, ProfitsUpdate, updateProfits } from './sql/tables/profits';

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

let cronJobTime: string | schedule.RecurrenceSpecObjLit = { second: 0, minute: 5, hour: 0, tz: 'America/Toronto' };
if (process.env.NODE_ENV === 'development') {
    cronJobTime = '*/1 * * * *';
}

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

function createTaxesResponse(taxesTotal: number, userIds: string[], balances: string[], newBalances: string[]): MessageCreateOptions[] {
    if (userIds.length === 0 || balances.length === 0 || newBalances.length === 0) return [{content: 'No taxes today.'}];

    const embeds = [];
    for (let i = 0; i < userIds.length; i += UsersPerEmbed) {
        const embed = new EmbedBuilder();
        if (i === 0) {
            embed
                .setTitle(`${time(new Date(), 'd')} Taxes`)
                .addFields(
                    emptyEmbedFieldInline,
                    emptyEmbedFieldInline,
                    {name: 'Taxes Total', value: taxesTotal.toLocaleString(), inline: true}
                );
        }

        const endIndex = i + UsersPerEmbed;
        embed.addFields(
            {name: 'User', value: userIds.slice(i, endIndex).map(id => userMention(id)).join('\n'), inline: true},
            {name: 'Balance', value: balances.slice(i, endIndex).join('\n'), inline: true},
            {name: 'New Balance', value: newBalances.slice(i, endIndex).join('\n'), inline: true}
        );
        embeds.push(embed);
    }

    const msgs: MessageCreateOptions[] = [];
    for (let i = 0; i < embeds.length; i += MessageEmbedLimit) {
        msgs.push({embeds: embeds.slice(i, i + MessageEmbedLimit)});
    }
    
    return msgs;
}

function createWelfareResponse(welfareTotal: number, userIds: string[], balances: string[], newBalances: string[]): MessageCreateOptions[] {
    if (userIds.length === 0 || balances.length === 0 || newBalances.length === 0) return [{content: 'No welfare today.'}];

    const embeds = [];
    for (let i = 0; i < userIds.length; i += UsersPerEmbed) {
        const embed = new EmbedBuilder();
        if (i === 0) {
            embed
                .setTitle(`${time(new Date(), 'd')} Welfare`)
                .addFields(
                    emptyEmbedFieldInline,
                    emptyEmbedFieldInline,
                    {name: 'Welfare Total', value: welfareTotal.toLocaleString(), inline: true}
                );
        }

        const endIndex = i + UsersPerEmbed;
        embed.addFields(
            {name: 'User', value: userIds.slice(i, endIndex).map(id => userMention(id)).join('\n'), inline: true},
            {name: 'Balance', value: balances.slice(i, endIndex).join('\n'), inline: true},
            {name: 'New Balance', value: newBalances.slice(i, endIndex).join('\n'), inline: true}
        );
        embeds.push(embed);
    }

    const msgs: MessageCreateOptions[] = [];
    for (let i = 0; i < embeds.length; i += MessageEmbedLimit) {
        msgs.push({embeds: embeds.slice(i, i + MessageEmbedLimit)});
    }

    return msgs;
}

// Daily tax/welfare
function scheduleDailyTaxWelfareCronJob(client: Client) {
    schedule.scheduleJob(cronJobTime, async function() {
        if (!process.env.CLIENT_ID) return;

        // Calculate taxes
        let userCringePoints = await getAllUserCringePoints();
        const taxUpdates: CringePointsUpdate[] = [];
        const taxProfitUpdates: ProfitsUpdate[] =[];

        const taxUserIds: string[] = [];
        const taxesBalances: string[] = [];
        const taxesNewBalances: string[] = [];
        let taxesTotal = 0;

        for (let i = 0; i < userCringePoints.length; i++) {
            const {USER_ID, POINTS} = userCringePoints[i];
            if (USER_ID === process.env.CLIENT_ID) continue;
            const tax = calculateDailyTax(POINTS);
            if (tax > 0) {
                taxUpdates.push({userId: USER_ID, points: -tax});
                taxProfitUpdates.push({userId: USER_ID, type: ProfitType.Tax, profit: -tax});

                taxUserIds.push(USER_ID);
                taxesBalances.push(`${POINTS.toLocaleString()} (${(-tax).toLocaleString()})`);
                taxesNewBalances.push(`${(POINTS-tax).toLocaleString()}`);
            }
            taxesTotal += tax;
        }
        // Update user points and profits with taxes
        await houseUserTransfer(taxUpdates);
        void updateProfits(taxProfitUpdates);

        // Send tax embed message
        if (process.env.CASINO_CHANNEL_ID) {
            const channel = await fetchChannel(client, process.env.CASINO_CHANNEL_ID);
            if (!channel?.isTextBased()) return;
            const msgs = createTaxesResponse(taxesTotal, taxUserIds, taxesBalances, taxesNewBalances);
            for (const msg of msgs) {
                await channel.send(msg);
            }
        }

        // Calculate welfare
        userCringePoints = await getAllUserCringePoints();

        const welfareUpdates: CringePointsUpdate[] = [];
        const welfareProfitUpdates: ProfitsUpdate[] =[];
        
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
            welfareUpdates.push({userId: USER_ID, points: welfare});
            welfareProfitUpdates.push({userId: USER_ID, type: ProfitType.Welfare, profit: welfare});
            welfarePool -= welfare;
            welfareTotal += welfare;
            welfareUserIds.push(USER_ID);
            welfareBalances.push(`${POINTS.toLocaleString()} (+${(welfare).toLocaleString()})`);
            welfareNewBalances.push(`${(POINTS + welfare).toLocaleString()}`);
        }
        // Update user points and profits with welfare
        await houseUserTransfer(welfareUpdates);
        void updateProfits(welfareProfitUpdates);

        // Send welfare embed message
        if (process.env.CASINO_CHANNEL_ID) {
            const channel = await fetchChannel(client, process.env.CASINO_CHANNEL_ID);
            if (!channel?.isTextBased()) return;
            const msgs = createWelfareResponse(welfareTotal, welfareUserIds, welfareBalances, welfareNewBalances);
            for (const msg of msgs) {
                await channel.send(msg);
            }
        }
    });
}

export { dailyTaxBracket, calculateDailyTax, scheduleDailyTaxWelfareCronJob };