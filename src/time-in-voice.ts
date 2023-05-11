import { ChannelType, Client } from 'discord.js';
import { updateTimeInVoice } from './sql/time-in-voice';
import { insertUserPairs, updateTimeInVoiceTogether, TimeInVoiceTogetherUpdate, PairInsert } from './sql/time-in-voice-together';
import { timeInMS } from './util';

const userJoinTime: {[key:string]: {guildId: string, channelId: string, time: number}} = {};

function initUsers(client: Client) {
    const time = Date.now();
    for (const guild of client.guilds.cache.values()) {
        for (const channel of guild.channels.cache.values()) {
            if (channel.type === ChannelType.GuildVoice) {
                for (const member of channel.members.values()) {
                    if (!member.user.bot) {
                        userJoinTime[member.id] = {guildId: guild.id, channelId: channel.id, time};
                    }
                }
            }
        }
    }
}

function userJoin(userId: string, channelId: string, guildId: string) {
    userJoinTime[userId] = {guildId, channelId, time: Date.now()};
}

function updatePairs(userId: string) {
    const usersSameInChannel = Object.keys(userJoinTime).filter(id => userJoinTime[id].channelId === userJoinTime[userId].channelId && id !== userId);
    const pairInserts: Array<PairInsert> = [];
    const timeInVoiceTogetherUpdates: Array<TimeInVoiceTogetherUpdate> = [];
    const currentTime = Date.now();
    for (const otherUserId of usersSameInChannel) {
        pairInserts.push({userId1: userId, userId2: otherUserId});
        const startTime = Math.max(userJoinTime[userId].time, userJoinTime[otherUserId].time);
        const duration = currentTime - startTime;
        // Only update if duration is greater than 5 minutes
        if (duration > timeInMS.minute * 5) {
            const startDate = new Date(startTime).toISOString().slice(0, 10);
            timeInVoiceTogetherUpdates.push({userId1: userId, userId2: otherUserId, guildId: userJoinTime[userId].guildId, startDate, time: duration});
        }
    }
    void insertUserPairs(pairInserts);
    void updateTimeInVoiceTogether(timeInVoiceTogetherUpdates);
}

function userChangeChannel(userId: string, channelId: string,) {
    const startDate = new Date(userJoinTime[userId].time).toISOString().slice(0, 10);
    const currentTime = Date.now();
    void updateTimeInVoice([{userId, guildId: userJoinTime[userId].guildId, startDate, time: currentTime- userJoinTime[userId].time}]);
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

export default { userJoinTime, initUsers, userJoin, updatePairs, userChangeChannel, userLeave };