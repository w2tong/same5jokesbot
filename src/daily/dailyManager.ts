import { Client, EmbedBuilder, time, userMention } from 'discord.js';
import { blackjackEmitter } from '../commands/blackjack/BlackjackGame';
import { gambleEmitter } from '../commands/gamble/subcommands/gamble';
import { getRandomRange } from '../util/util';
import schedule from 'node-schedule';
import dailies, { DailyId } from './dailies';
import { getDailyProgress, insertDailyProgress, truncateDailyProgress, updateDailyProgress } from '../sql/tables/daily-progress';
import { getUserCringePoints, updateCringePoints } from '../sql/tables/cringe-points';
import { emptyEmbedFieldInline, fetchChannel } from '../util/discordUtil';
import { slotsEmitter } from '../commands/slots/subcommands/spin';
import { lotteryEmitter } from '../commands/lottery/lotteryManager';
import { stealEmitter } from '../commands/steal/stealManager';
import { deathRollEmitter } from '../commands/death-roll/deathRoll';

const DailliesPerDay = 3;

let currDailies: Set<DailyId> = new Set<DailyId>();
function generateDailies(num: number) {
    currDailies = new Set();
    const keys = Object.keys(dailies) as DailyId[];
    for (let i = 0; i < num && keys.length > 0; i++) {
        const idx = getRandomRange(keys.length);
        currDailies.add(keys.splice(idx, 1)[0]);
    }
}
type DailyProg = {progress: number, completed: boolean}
let userDailies: {[userId: string]: {[key in DailyId]: DailyProg} | Record<string, never>} = {};

async function generateUserDailies(client: Client) {
    const dailies = Array.from(currDailies);
    const inserts = [];
    for (const {bot, id} of client.users.cache.values()) {
        if (bot) continue;
        userDailies[id] = {};
        for (const dailyId of dailies) {
            userDailies[id][dailyId] = {progress: 0, completed: false};
            inserts.push({userId: id, dailyId});
        }
    }
    await insertDailyProgress(inserts);
}

function scheduleDailiesCronJob(client: Client) {
    schedule.scheduleJob({ second: 0, minute: 0, hour: 0, tz: 'America/Toronto' }, async function() {
        generateDailies(DailliesPerDay);
        userDailies = {};
        await truncateDailyProgress();
        await generateUserDailies(client);

        if (process.env.CASINO_CHANNEL_ID) {
            const casinoChannel = await fetchChannel(client, process.env.CASINO_CHANNEL_ID);
            if (casinoChannel?.isTextBased()) {
                const embed = new EmbedBuilder()
                    .setTitle(`${time(new Date(), 'd')} Daily Quests`);
                const quests: string[] = [];
                const rewards: string[] = [];
                for (const dailyId of currDailies.values()) {
                    quests.push(dailies[dailyId].description);
                    rewards.push(`${dailies[dailyId].reward.toLocaleString()}`);
                }
                embed.addFields(
                    {name: 'Quest', value: quests.join('\n'), inline: true},
                    {name: 'Reward', value: rewards.join('\n'), inline: true},
                );

                await casinoChannel.send({embeds: [embed]});
            }
        }
        
    });
}

async function updateDaily(dailyId: DailyId, userId: string, progInc: number) {
    if (currDailies.has(dailyId)) {
        const daily = userDailies[userId][dailyId];
        if (daily.completed) return;
        daily.progress += progInc;
        await updateDailyProgress(userId, dailyId, daily.progress, daily.completed);
    }
}

async function completeDaily(dailyId: DailyId, userId: string, client: Client, channelId?: string) {
    if (currDailies.has(dailyId)) {
        const daily = userDailies[userId][dailyId];
        if (daily.completed) return;
        if (daily.progress >= dailies[dailyId].maxProgress) {
            daily.progress = dailies[dailyId].maxProgress;
            daily.completed = true;
            await updateDailyProgress(userId, dailyId, daily.progress, daily.completed);

            const channel = await fetchChannel(client, channelId ?? process.env.CASINO_CHANNEL_ID ?? '');
            const balance = await getUserCringePoints(userId) ?? 0;
            if (channel?.isTextBased()) {
                const embed = new EmbedBuilder()
                    .setTitle('Daily Quest Completed')
                    .addFields(
                        {name: 'User', value: userMention(userId), inline: true},
                        {name: 'Quest', value: dailies[dailyId].description, inline: true},
                        emptyEmbedFieldInline,
                        {name: 'Balance', value: `${balance.toLocaleString()} (+${dailies[dailyId].reward.toLocaleString()})`, inline: true},
                        {name: 'New Balance', value: (balance + dailies[dailyId].reward).toLocaleString(), inline: true},
                        emptyEmbedFieldInline
                    );
                await channel.send({embeds: [embed]});
            }

            await updateCringePoints([{userId, points: dailies[dailyId].reward}]);
        }
    }
}

// TODO: send daily compelte msg (embed prob)

blackjackEmitter.on('end', async (userId, wager, profit, client, channelId) => {
    const dailyUpdates = [updateDaily('bjGame', userId, 1)];
    if (profit > 0) {
        dailyUpdates.push(
            updateDaily('bjWin', userId, 1),
            updateDaily('bjProfit', userId, profit)
        );
    }
    await Promise.all(dailyUpdates);

    await completeDaily('bjGame', userId, client, channelId);
    await completeDaily('bjWin', userId, client, channelId);
    await completeDaily('bjProfit', userId, client, channelId);
});

deathRollEmitter.on('end', async (winnerId, loserId, wager, client, channelId) => {
    await Promise.all([
        updateDaily('deathRollGame', loserId, 1),
        updateDaily('deathRollGame', winnerId, 1),
        updateDaily('deathRollWin', winnerId, 1),
        updateDaily('deathRollProfit', winnerId, wager)
    ]);

    await Promise.all([
        completeDaily('deathRollGame', loserId, client, channelId),
        completeDaily('deathRollGame', winnerId, client, channelId)
    ]);
    
    await completeDaily('deathRollWin', winnerId, client, channelId);
    await completeDaily('deathRollProfit', winnerId, client, channelId);
});

gambleEmitter.on('end', async (userId, wager, profit, client, channelId) => {
    const dailyUpdates = [updateDaily('gGame', userId, 1)];
    if (profit > 0) {
        dailyUpdates.push(
            updateDaily('gWin', userId, 1),
            updateDaily('gProfit', userId, profit)
        );
    }
    await Promise.all(dailyUpdates);

    await completeDaily('gGame', userId, client, channelId);
    await completeDaily('gWin', userId, client, channelId);
    await completeDaily('gProfit', userId, client, channelId);
});

lotteryEmitter.on('buy', async (userId, tickets, client, channelId) => {
    await updateDaily('lotteryBuy', userId, tickets);

    await completeDaily('lotteryBuy', userId, client, channelId);
});

slotsEmitter.on('end', async (userId, wager, profit, client, channelId) => {
    const dailyUpdates = [updateDaily('slotsGame', userId, 1)];
    if (profit > 0) {
        dailyUpdates.push(
            updateDaily('slotsWin', userId, 1),
            updateDaily('slotsProfit', userId, profit)
        );
    }
    await Promise.all(dailyUpdates);

    await completeDaily('slotsGame', userId, client, channelId);
    await completeDaily('slotsWin', userId, client, channelId);
    await completeDaily('slotsProfit', userId, client, channelId);
});

stealEmitter.on('steal', async (userId, amount, client, channelId) => {
    await updateDaily('stealAttempt', userId, amount);

    await completeDaily('stealAttempt', userId, client, channelId); 
});

async function loadDailyProgress() {
    const dailyProg = await getDailyProgress();
    for (const {USER_ID, DAILY_ID, PROGRESS, COMPLETED} of dailyProg) {
        if (!userDailies[USER_ID]) userDailies[USER_ID] = {};
        const dailyId = DAILY_ID as DailyId;
        currDailies.add(dailyId);
        userDailies[USER_ID][dailyId] = {progress: PROGRESS, completed: COMPLETED === 1};
    }
}

export { currDailies, userDailies, scheduleDailiesCronJob, loadDailyProgress };