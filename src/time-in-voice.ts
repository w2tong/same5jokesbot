import { ChannelType, Client, VoiceBasedChannel } from 'discord.js';
import { updateTimeInVoice } from './sql/time-in-voice';
import { insertUserPairs, updateTimeInVoiceTogether } from './sql/time-in-voice-together';

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
    for (const otherUserId of usersSameInChannel) {
        void insertUserPairs(userId, otherUserId);
        const startTime = Math.max(userJoinTime[userId].time, userJoinTime[otherUserId].time);
        const startDate = new Date(startTime).toISOString().slice(0, 10);
        void updateTimeInVoiceTogether(userId, otherUserId, userJoinTime[userId].guildId, startDate, Date.now() - startTime);
    }
}

function userChangeChannel(userId: string, channelId: string,) {
    updatePairs(userId);
    userJoinTime[userId].channelId = channelId;
    userJoinTime[userId].time = Date.now();
}

function userLeave(userId: string) {
    if (userJoinTime[userId]) {
        const date = new Date(userJoinTime[userId].time).toISOString().slice(0, 10);
        void updateTimeInVoice(userId, userJoinTime[userId].guildId, date, Date.now() - userJoinTime[userId].time);
        updatePairs(userId);
        delete userJoinTime[userId];
    }
}

export default { userJoinTime, initUsers, userJoin, updatePairs, userChangeChannel, userLeave };