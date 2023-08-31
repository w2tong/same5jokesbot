import { Client, EmbedBuilder, User, time, userMention } from 'discord.js';
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

let DailliesPerDay = 3;
let cronJobTime: string | schedule.RecurrenceSpecObjLit = { second: 0, minute: 0, hour: 0, tz: 'America/Toronto' };
if (process.env.NODE_ENV === 'development') {
    DailliesPerDay = Object.keys(dailies).length;
    cronJobTime = '*/5 * * * *';
}

function scheduleDailiesCronJob(client: Client) {
    schedule.scheduleJob(cronJobTime, async function() {
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

async function completeDaily(dailyId: DailyId, user: User, client: Client, channelId?: string) {
    if (currDailies.has(dailyId)) {
        const daily = userDailies[user.id][dailyId];
        if (daily.completed) return;
        if (daily.progress >= dailies[dailyId].maxProgress) {
            daily.progress = dailies[dailyId].maxProgress;
            daily.completed = true;
            await updateDailyProgress(user.id, dailyId, daily.progress, daily.completed);

            const channel = await fetchChannel(client, channelId ?? process.env.CASINO_CHANNEL_ID ?? '');
            const balance = await getUserCringePoints(user.id) ?? 0;
            if (channel?.isTextBased()) {
                const embed = new EmbedBuilder()
                    .setAuthor({name: `${user.username} completed a Daily Quest`, iconURL: user.displayAvatarURL()})
                    .addFields(
                        {name: 'User', value: userMention(user.id), inline: true},
                        {name: 'Quest', value: dailies[dailyId].description, inline: true},
                        emptyEmbedFieldInline,
                        {name: 'Balance', value: `${balance.toLocaleString()} (+${dailies[dailyId].reward.toLocaleString()})`, inline: true},
                        {name: 'New Balance', value: (balance + dailies[dailyId].reward).toLocaleString(), inline: true},
                        emptyEmbedFieldInline
                    );
                await channel.send({embeds: [embed]});
            }

            await updateCringePoints([{userId: user.id, points: dailies[dailyId].reward}]);
        }
    }
}

// TODO: send daily compelte msg (embed prob)

blackjackEmitter.on('end', async (user, wager, profit, client, channelId) => {
    const dailyUpdates = [
        updateDaily('bjGame', user.id, 1),
        updateDaily('bjWager', user.id, wager),
    ];
    if (profit > 0) {
        dailyUpdates.push(
            updateDaily('bjWin', user.id, 1),
            updateDaily('bjProfit', user.id, profit)
        );
    }
    await Promise.all(dailyUpdates);

    await completeDaily('bjGame', user, client, channelId);
    await completeDaily('bjWager', user, client, channelId);
    await completeDaily('bjWin', user, client, channelId);
    await completeDaily('bjProfit', user, client, channelId);
});

deathRollEmitter.on('end', async (winner, loser, wager, client, channelId) => {
    await Promise.all([
        updateDaily('deathRollGame', loser.id, 1),
        updateDaily('deathRollGame', winner.id, 1),
        updateDaily('deathRollWager', loser.id, wager),
        updateDaily('deathRollWager', winner.id, wager),
        updateDaily('deathRollWin', winner.id, 1),
        updateDaily('deathRollProfit', winner.id, wager)
    ]);

    await Promise.all([
        completeDaily('deathRollGame', loser, client, channelId),
        completeDaily('deathRollGame', winner, client, channelId),
        completeDaily('deathRollWager', loser, client, channelId),
        completeDaily('deathRollWager', winner, client, channelId)
    ]);
    
    await completeDaily('deathRollWin', winner, client, channelId);
    await completeDaily('deathRollProfit', winner, client, channelId);
});

gambleEmitter.on('end', async (user, wager, profit, client, channelId) => {
    const dailyUpdates = [
        updateDaily('gGame', user.id, 1),
        updateDaily('gWager', user.id, wager),
    ];
    if (profit > 0) {
        dailyUpdates.push(
            updateDaily('gWin', user.id, 1),
            updateDaily('gProfit', user.id, profit)
        );
    }
    await Promise.all(dailyUpdates);

    await completeDaily('gGame', user, client, channelId);
    await completeDaily('gWager', user, client, channelId);
    await completeDaily('gWin', user, client, channelId);
    await completeDaily('gProfit', user, client, channelId);
});

lotteryEmitter.on('buy', async (user, tickets, client, channelId) => {
    await updateDaily('lotteryBuy', user.id, tickets);

    await completeDaily('lotteryBuy', user, client, channelId);
});

slotsEmitter.on('end', async (user, wager, profit, client, channelId) => {
    const dailyUpdates = [
        updateDaily('slotsGame', user.id, 1),
        updateDaily('slotsWager', user.id, wager)
    ];
    if (profit > 0) {
        dailyUpdates.push(
            updateDaily('slotsWin', user.id, 1),
            updateDaily('slotsProfit', user.id, profit)
        );
    }
    await Promise.all(dailyUpdates);

    await completeDaily('slotsGame', user, client, channelId);
    await completeDaily('slotsWager', user, client, channelId);
    await completeDaily('slotsWin', user, client, channelId);
    await completeDaily('slotsProfit', user, client, channelId);
});

stealEmitter.on('steal', async (user, amount, client, channelId) => {
    await updateDaily('stealAttempt', user.id, 1);

    await completeDaily('stealAttempt', user, client, channelId); 
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