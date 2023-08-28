import { Client } from 'discord.js';
import { blackjackEmitter } from '../commands/blackjack/BlackjackGame';
import { gambleEmitter } from '../commands/gamble/subcommands/gamble';
import { getRandomRange } from '../util/util';
import schedule from 'node-schedule';
import dailies, { DailyId } from './dailies';
import { getDailyProgress, insertDailyProgress, truncateDailyProgress, updateDailyProgress } from '../sql/tables/daily-progress';
import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';

type DailyEvents = {
    complete: (userId: string, dailyId: string) => Promise<void>
  }
const dailyEmitter = new EventEmitter() as TypedEmitter<DailyEvents>;

let currDailies: Set<DailyId> = new Set<DailyId>();
function generateDailies(num: number) {
    currDailies = new Set();
    const used = new Set();
    const keys = Object.keys(dailies) as DailyId[];
    let i = 0;
    while (i < num) {
        const id = keys[getRandomRange(keys.length)];
        if (!used.has(id)) {
            currDailies.add(id);
            used.add(id);
            i++;
        }
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
    schedule.scheduleJob({ second: 0, minute: 0, tz: 'America/Toronto' }, async function() {
        generateDailies(6);
        userDailies = {};
        await truncateDailyProgress();
        await generateUserDailies(client);
    });
}

async function updateGameDaily(dailyId: DailyId, userId: string) {
    if (currDailies.has(dailyId)) {
        const daily = userDailies[userId][dailyId];
        if (daily.completed) return;
        daily.progress++;
        await updateDailyProgress(userId, dailyId, daily.progress, daily.completed);
        await completeDaily(dailyId, userId);
    }
}
async function updateWinDaily(dailyId: DailyId, userId: string, profit: number) {
    if (currDailies.has(dailyId) && profit > 0) {
        const daily = userDailies[userId][dailyId];
        if (daily.completed) return;
        daily.progress++;
        await updateDailyProgress(userId, dailyId, daily.progress, daily.completed);
        await completeDaily(dailyId, userId);
    }
}
async function updateProfitDaily(dailyId: DailyId, userId: string, profit: number) {
    if (currDailies.has(dailyId) && profit > 0) {
        const daily = userDailies[userId][dailyId];
        if (daily.completed) return;
        daily.progress += profit;
        await updateDailyProgress(userId, dailyId, daily.progress, daily.completed);
        await completeDaily(dailyId, userId);
    }
}

async function completeDaily(dailyId: DailyId, userId: string) {
    if (currDailies.has(dailyId)) {
        const daily = userDailies[userId][dailyId];
        if (daily.progress >= dailies[dailyId].maxProgress) {
            daily.progress = dailies[dailyId].maxProgress;
            daily.completed = true;
            // update points
            await updateDailyProgress(userId, dailyId, daily.progress, daily.completed);
            dailyEmitter.emit('complete', userId, dailyId);
        }
    }
}

// TODO: send daily compelte msg (embed prob)

blackjackEmitter.on('end', async (userId, profit) => {
    await Promise.all([
        updateGameDaily('bjGame', userId),
        updateWinDaily('bjWin', userId, profit),
        updateProfitDaily('bjProfit', userId, profit)
    ]);

    console.log(userDailies[userId]);
});

gambleEmitter.on('end', async (userId, profit) => {
    await Promise.all([
        updateGameDaily('gGame', userId),
        updateWinDaily('gWin', userId, profit),
        updateProfitDaily('gProfit', userId, profit)
    ]);
    
    console.log(userDailies[userId]);
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

export { scheduleDailiesCronJob, loadDailyProgress };