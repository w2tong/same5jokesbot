import { Client } from 'discord.js';
import { blackjackEmitter } from '../commands/blackjack/BlackjackGame';
import { gambleEmitter } from '../commands/gamble/subcommands/gamble';
import { getRandomRange } from '../util/util';
import schedule from 'node-schedule';
import dailies, { DailyId } from './dailies';

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

function generateuserDailies(client: Client) {
    const dailies = Array.from(currDailies);
    for (const {bot, id} of client.users.cache.values()) {
        if (bot) continue;
        userDailies[id] = {};
        for (const dailyId of dailies) {
            userDailies[id][dailyId] = {progress: 0, completed: false};
        }
    }
}

function scheduleDailiesCronJob(client: Client) {
    schedule.scheduleJob({ second: 0, tz: 'America/Toronto' }, function() {
        generateDailies(6);
        userDailies = {};
        generateuserDailies(client);
    });
}

function updateGameDaily(dailyId: DailyId, userId: string) {
    if (currDailies.has(dailyId)) {
        const daily = userDailies[userId][dailyId];
        if (daily.completed) return;
        daily.progress++;
        // update dailyprogress db
        if (daily.progress >= dailies[dailyId].maxProgress) {
            daily.completed = true;
            // update points
            // update dailyprogress db
        }
    }
}
function updateWinDaily(dailyId: DailyId, userId: string, profit: number) {
    if (currDailies.has(dailyId) && profit > 0) {
        const daily = userDailies[userId][dailyId];
        if (daily.completed) return;
        daily.progress++;
        // update dailyprogress db
        if (daily.progress >= dailies[dailyId].maxProgress) {
            daily.completed = true;
            // update points
            // update dailyprogress db
        }
    }
}
function updateProfitDaily(dailyId: DailyId, userId: string, profit: number) {
    if (currDailies.has(dailyId) && profit > 0) {
        const daily = userDailies[userId][dailyId];
        if (daily.completed) return;
        daily.progress += profit;
        // update dailyprogress db
        if (daily.progress >= dailies[dailyId].maxProgress) {
            daily.progress = dailies[dailyId].maxProgress;
            daily.completed = true;
            // update points
            // update dailyprogress db
        }
    }
}

blackjackEmitter.on('end', (userId, profit) => {
    updateGameDaily('bjGame', userId);
    updateWinDaily('bjWin', userId, profit);
    updateProfitDaily('bjProfit', userId, profit);
    console.log(userDailies[userId]);
});

gambleEmitter.on('end', (userId, profit) => {
    updateGameDaily('gGame', userId);
    updateWinDaily('gWin', userId, profit);
    updateProfitDaily('gProfit', userId, profit);
    console.log(userDailies[userId]);
});

function loadUserDailies() {
    // load daily progress from DB
}

export { scheduleDailiesCronJob, loadUserDailies };