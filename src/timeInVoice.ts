import { ChannelType, Client } from 'discord.js';
import schedule from 'node-schedule';
import { updateCringePoints, CringePointsUpdate } from './sql/tables/cringe-points';
import { TimeInVoiceUpdate, updateTimeInVoice } from './sql/tables/time-in-voice';
import { insertUserPairs, updateTimeInVoiceTogether, TimeInVoiceTogetherUpdate, PairInsert } from './sql/tables/time-in-voice-together';
import { ProfitType, ProfitsUpdate, updateProfits } from './sql/tables/profits';

const pointMultiplier = 2;
const userJoinTime: {[key:string]: {channelId: string, guildId: string, time: number, pointMultiplier: number}} = {};

function initUsers(client: Client) {
    const time = Date.now();
    for (const guild of client.guilds.cache.values()) {
        for (const channel of guild.channels.cache.values()) {
            if (channel.type === ChannelType.GuildVoice) {
                for (const member of channel.members.values()) {
                    if (!member.user.bot) {
                        userJoinTime[member.id] = {channelId: channel.id, guildId: guild.id, time, pointMultiplier};
                    }
                }
            }
        }
    }
}

function userJoin(userId: string, channelId: string, guildId: string) {
    userJoinTime[userId] = {guildId, channelId, time: Date.now(), pointMultiplier};
}

function updatePairs(userId: string) {
    if (!userJoinTime[userId]) return;
    const usersSameInChannel = Object.keys(userJoinTime).filter(id => userJoinTime[id].channelId === userJoinTime[userId].channelId && id !== userId);
    const pairInserts: PairInsert[] = [];
    const timeInVoiceTogetherUpdates: TimeInVoiceTogetherUpdate[] = [];
    const currentTime = Date.now();
    for (const otherUserId of usersSameInChannel) {
        pairInserts.push({userId1: userId, userId2: otherUserId});
        const startTime = Math.max(userJoinTime[userId].time, userJoinTime[otherUserId].time);
        const duration = currentTime - startTime;
        const startDate = new Date(startTime).toISOString().slice(0, 10);
        timeInVoiceTogetherUpdates.push({userId1: userId, userId2: otherUserId, guildId: userJoinTime[userId].guildId, startDate, time: duration});
    }
    void insertUserPairs(pairInserts);
    void updateTimeInVoiceTogether(timeInVoiceTogetherUpdates);
}

async function userChangeChannel(userId: string, channelId: string) {
    const startDate = new Date(userJoinTime[userId].time).toISOString().slice(0, 10);
    const currentTime = Date.now();
    await updateTimeInVoice([{userId, guildId: userJoinTime[userId].guildId, startDate, time: currentTime- userJoinTime[userId].time}]);
    updatePairs(userId);
    userJoinTime[userId].channelId = channelId;
    userJoinTime[userId].time = currentTime;
}

function userLeave(userId: string) {
    if (userJoinTime[userId]) {
        const startDate = new Date(userJoinTime[userId].time).toISOString().slice(0, 10);
        void updateTimeInVoice([{userId, guildId: userJoinTime[userId].guildId, startDate, time: Date.now() - userJoinTime[userId].time}]);
        updatePairs(userId);
        delete userJoinTime[userId];
    }
}

function scheduleUpdateTimeInVoiceCronJob() {
    schedule.scheduleJob('*/15 * * * *', function() {
        const currTime = Date.now();
        const timeInVoiceUpdates: TimeInVoiceUpdate[] = [];
        for (const [userId, {guildId, time}] of Object.entries(userJoinTime)) {
            const startDate = new Date(time).toISOString().slice(0, 10);
            timeInVoiceUpdates.push({userId, guildId, startDate, time: currTime - time});
            userJoinTime[userId].time = currTime;
        }
        void updateTimeInVoice(timeInVoiceUpdates);
    });
}

function scheduleUpdateTimeInVoiceTogetherCronJob() {
    schedule.scheduleJob('*/15 * * * *', function() {
        const currTime = Date.now();
        const channelUserMap: { [key: string]: string[] } = {};

        for (const userId of Object.keys(userJoinTime)) {
            if (!channelUserMap[userJoinTime[userId].channelId]) {
                channelUserMap[userJoinTime[userId].channelId] = [userId];
            }
            else {
                channelUserMap[userJoinTime[userId].channelId].push(userId);
            }
        }

        const pairInserts: PairInsert[] = [];
        const timeInVoiceTogetherUpdates: TimeInVoiceTogetherUpdate[] = [];
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

const cringePointsPerUpdate = 50;
const pointMultiInc = 2;
const pointMultiCap = 10;
function scheduleUpdateCringePointsCronJob(client: Client) {
    schedule.scheduleJob('*/10 * * * *', async function() {
        const cringePointUpdates: CringePointsUpdate[] = [];
        const profitUpdates: ProfitsUpdate[] = [];
        for (const {bot, id} of client.users.cache.values()) {
            if (bot) continue;
            let points = cringePointsPerUpdate;
            if (userJoinTime[id]) {
                let pointMultiplier = userJoinTime[id].pointMultiplier;
                points *= pointMultiplier;
                if (pointMultiplier < pointMultiCap) {
                    userJoinTime[id].pointMultiplier = pointMultiplier = Math.min(pointMultiplier + pointMultiInc, pointMultiCap);
                }
            }
            cringePointUpdates.push({userId: id, points});
            profitUpdates.push({userId: id, type: ProfitType.Income, profit: points});
        }
        await Promise.all([updateCringePoints(cringePointUpdates), updateProfits(profitUpdates)]);
    });
}

export default { userJoinTime, initUsers, userJoin, updatePairs, userChangeChannel, userLeave };
export { scheduleUpdateTimeInVoiceCronJob, scheduleUpdateTimeInVoiceTogetherCronJob, scheduleUpdateCringePointsCronJob };