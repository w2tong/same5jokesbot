import { ChannelType, Client, GuildMember, VoiceBasedChannel } from 'discord.js';
import { updateTimeInVoice } from './sql/time-in-voice';
import { insertUserPairs, updateTimeInVoiceTogether } from './sql/time-in-voice-together';

const userJoinTime: {[key:string]: {guildId: string, channel: VoiceBasedChannel, time: number}} = {};

function initUsers(client: Client) {
    const time = Date.now();
    for (const guild of client.guilds.cache.values()) {
        for (const channel of guild.channels.cache.values()) {
            if (channel.type === ChannelType.GuildVoice) {
                for (const member of channel.members.values()) {
                    if (!member.user.bot) {
                        userJoinTime[member.id] = {guildId: guild.id, channel: channel, time};
                    }
                }
            }
        }
    }
}

function userJoin(userId: string, channel: VoiceBasedChannel, guildId: string) {
    userJoinTime[userId] = {guildId, channel, time: Date.now()};
}

function updatePairs(userId: string) {
    for (const otherUser of userJoinTime[userId].channel.members.values()) {
        const otherUserId = otherUser.id;
        if (userId === otherUserId || otherUser.user.bot) continue;
        void insertUserPairs(userId, otherUserId);
        const startTime = Math.max(userJoinTime[userId].time, userJoinTime[otherUserId].time);
        const startDate = new Date(startTime).toISOString().slice(0, 10);
        void updateTimeInVoiceTogether(userId, otherUserId, userJoinTime[userId].guildId, startDate, Date.now() - startTime);
    }
}

function userChangeChannel(userId: string, channel: VoiceBasedChannel) {
    updatePairs(userId);
    userJoinTime[userId].channel = channel;
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