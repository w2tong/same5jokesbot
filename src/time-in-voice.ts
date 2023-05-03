import { ChannelType, Client } from 'discord.js';
import { updateTimeInVoice } from './sql/time-in-voice';

const userJoinTime: {[key:string]: {guildId: string, time: number}} = {};

function initUsers(client: Client) {
    const time = Date.now();
    for (const guild of client.guilds.cache.values()) {
        for (const channel of guild.channels.cache.values()) {
            if (channel.type === ChannelType.GuildVoice) {
                for (const member of channel.members.values()) {
                    if (!member.user.bot) {
                        userJoinTime[member.id] = {guildId: guild.id, time};
                    }
                }
            }
        }
    }
}

function userJoin(userId: string, guildId: string) {
    userJoinTime[userId] = {guildId, time: Date.now()};
}

function userLeave(userId: string) {
    if (userJoinTime[userId]) {
        const date = new Date(userJoinTime[userId].time).toISOString().slice(0, 10);
        void updateTimeInVoice(userId, userJoinTime[userId].guildId, date, Date.now() - userJoinTime[userId].time);
        delete userJoinTime[userId];
    }
}

export default { userJoinTime, initUsers, userJoin, userLeave };