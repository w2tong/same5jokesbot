import { ChannelType, Client } from 'discord.js';
import schedule from 'node-schedule';
import oracledb from 'oracledb';
import * as dotenv from 'dotenv';
dotenv.config();
import { logError } from './logger';
import  timeInVoice from './timeInVoice';
import { updateCringePoints, CringePointsUpdate } from './sql/cringe-points';
import { TimeInVoiceUpdate, updateTimeInVoice } from './sql/time-in-voice';
import { insertUserPairs, updateTimeInVoiceTogether, TimeInVoiceTogetherUpdate, PairInsert } from './sql/time-in-voice-together';
import { fetchChannel } from './discordUtil';

// Weekly Tuesday reminder
function createTuesdayScheduleCronJob(client: Client, channelId: string) {
    schedule.scheduleJob({ second: 0, minute: 0, hour: 21, dayOfWeek: 2, tz: 'America/Toronto' }, async function() {
        const channel = await fetchChannel(client.channels, channelId);
        if (channel && channel.type === ChannelType.GuildText) {
            channel.send('Where 10.1.5').catch(logError);
        }
    });
}

function createUpdateTimeInVoiceCronJob() {
    schedule.scheduleJob('*/15 * * * *', function() {
        const currTime = Date.now();
        const userJoinTime = timeInVoice.userJoinTime;
        const timeInVoiceUpdates: Array<TimeInVoiceUpdate> = [];
        for (const [userId, {guildId, time}] of Object.entries(userJoinTime)) {
            const startDate = new Date(time).toISOString().slice(0, 10);
            timeInVoiceUpdates.push({userId, guildId, startDate, time: currTime - time});
            timeInVoice.userJoinTime[userId].time = currTime;
        }
        void updateTimeInVoice(timeInVoiceUpdates);
    });
}

function createUpdateTimeInVoiceTogetherCronJob() {
    schedule.scheduleJob('*/15 * * * *', function() {
        const currTime = Date.now();
        const channelUserMap: { [key: string]: Array<string> } = {};
        const userJoinTime = timeInVoice.userJoinTime;

        for (const userId of Object.keys(userJoinTime)) {
            if (!channelUserMap[userJoinTime[userId].channelId]) {
                channelUserMap[userJoinTime[userId].channelId] = [userId];
            }
            else {
                channelUserMap[userJoinTime[userId].channelId].push(userId);
            }
        }

        const pairInserts: Array<PairInsert> = [];
        const timeInVoiceTogetherUpdates: Array<TimeInVoiceTogetherUpdate> = [];
        for (const users of Object.values(channelUserMap)) {
            for (let i = 0; i < users.length - 1; i++) {
                for (let j = i + 1; j < users.length; j++) {
                    pairInserts.push({userId1: users[i], userId2: users[j]});
                    const startTime = Math.max(userJoinTime[users[i]].time, userJoinTime[users[j]].time);
                    const startDate = new Date(startTime).toISOString().slice(0, 10);
                    timeInVoiceTogetherUpdates.push({userId1: users[i], userId2: users[j], guildId: userJoinTime[users[i]].guildId, startDate, time: currTime - startTime});
                }
            }
        }
        void insertUserPairs(pairInserts);
        void updateTimeInVoiceTogether(timeInVoiceTogetherUpdates);
    });
}

const cringePointsPerUpdate = 10;
const inVoiceMultiplier = 100;
function createUpdateCringePointsCronJob(client: Client) {
    schedule.scheduleJob('*/10 * * * *', function() {
        const cringePointUpdates: Array<CringePointsUpdate> = [];
        for (const {bot, id} of client.users.cache.values()) {
            if (bot) continue;
            const update = {userId: id, points: cringePointsPerUpdate};
            if (timeInVoice.userJoinTime[id]) update.points *= inVoiceMultiplier;
            cringePointUpdates.push(update);
        }
        void updateCringePoints(cringePointUpdates);
    });
}

function createOracleDBLogStatisticsCronJob() {
    schedule.scheduleJob('0 * * * *', function() {
        const pool = oracledb.getPool();
        pool.logStatistics();
    });
}

function createCronJobs(client: Client) {
    if (process.env.MAIN_CHANNEL_ID) {
        createTuesdayScheduleCronJob(client, process.env.MAIN_CHANNEL_ID);
    }

    createUpdateTimeInVoiceCronJob();
    createUpdateTimeInVoiceTogetherCronJob();
    if (process.env.NODE_ENV !== 'production') {
        createOracleDBLogStatisticsCronJob();
    }
    createUpdateCringePointsCronJob(client);
}

export default createCronJobs;