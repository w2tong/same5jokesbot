import { ChannelType, Client, TextChannel, VoiceState } from 'discord.js';
import { logError } from '../logger';
import timeInVoice from '../timeInVoice';
import userIntros from '../userIntros';
import { fetchChannel } from '../util/discordUtil';
import { getMomentCurrentTimeEST } from '../util/util';
import { disconnectVoice, isInGuildVoice, joinVoicePlayAudio } from '../voice';
import * as dotenv from 'dotenv';
import audio from '../audioFileMap';
dotenv.config();

// const mainChannel: TextChannel;
let mainChannel: TextChannel;
async function initMainChannel(client: Client) {
    if (process.env.MAIN_CHANNEL_ID) {
        const channel = await fetchChannel(client.channels, process.env.MAIN_CHANNEL_ID);
        if (channel?.type === ChannelType.GuildText) {
            mainChannel = channel;
        }
    }
}

export default (oldState: VoiceState, newState: VoiceState) => {

    // Stop if user is a bot
    if (oldState.member?.user.bot) return;

    // Disconnect bot when users leave voice channel
    if (isInGuildVoice(oldState.guild.id)) {
        // Disconnect if all users in current bot channel disconnect or move to AFK channel
        if (
            (newState.channelId === null || newState.guild.afkChannelId === newState.channelId) && 
            (oldState.channel?.members.size === 1 && process.env.CLIENT_ID && oldState.channel?.members.has(process.env.CLIENT_ID))
        ) {
            disconnectVoice(oldState.guild.id);
        }

        // Disconnect if no users in any non-AFK voice channels
        let count = 0;
        oldState.guild.channels.cache.forEach((channel) => {
            if (channel.type === ChannelType.GuildVoice && channel.id !== channel.guild.afkChannelId) count += channel.members.size;
        });
        if (count === 1) {
            disconnectVoice(oldState.guild.id);
        }
    }

    // User leaves voice channel/moves to AFK channel
    if (newState.channelId === null || newState.channelId === newState.guild.afkChannelId) {
        const userId = oldState.member?.id;
        const members = oldState.channel?.members.values();
        if (userId && members) timeInVoice.userLeave(userId);
    }
    // User joins voice channel
    else if (newState.channel && (oldState.channelId === null || oldState.channelId === newState.guild.afkChannelId)) {
        const userId = oldState.member?.id;
        
        // Add user join time
        if (userId) {
            timeInVoice.userJoin(userId, newState.channelId, newState.guild.id);
        }

        // Play Good Morning Donda when joining channel in the morning
        const hour = getMomentCurrentTimeEST().utc().tz('America/Toronto').hour();
        if (hour >= 6 && hour < 12 && userId) {
            joinVoicePlayAudio(newState, audio.goodMorningDonda);
        }

        // Play user intro
        else {
            if (userId && userIntros[userId] && userIntros[userId]) {
                joinVoicePlayAudio(newState, userIntros[userId]);
            }
        }
        userIntros;
    }
    // User changes channels (not AFK channel)
    else if (oldState.guild.id === newState.guild.id && oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId && oldState.channelId !== newState.guild.afkChannelId) {
        const userId = oldState.member?.id;
        if (userId && newState.channel && newState.channel.type === ChannelType.GuildVoice ) {
            void timeInVoice.userChangeChannel(userId, newState.channelId);
        }
    }

    // Stop if user moves to AFK channel
    if (newState.guild.afkChannelId === newState.channelId) return;

    // Message when Azi leaves or chance when someone else leaves
    if (newState.member?.id == process.env.AZI_ID && newState.channelId === null && oldState.guild.id === process.env.GUILD_ID) {
        if (mainChannel) {
            mainChannel.send('You made Azi leave.').catch(logError);
        }
    }

    // Play teleporting fat guy when moving between channels
    if (
        oldState.channelId && newState.channelId && oldState.channelId != newState.channelId &&
        oldState.member && oldState.member.roles.cache.some(role => role.name === 'FAT')
    ) {
        joinVoicePlayAudio(newState, audio.teleportingFatGuyShort);
    }
};

export { initMainChannel };