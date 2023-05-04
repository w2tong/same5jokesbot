import { ChannelType, VoiceState } from 'discord.js';
import { logError } from '../logger';
import timeInVoice from '../time-in-voice';
import userIntros from './user-intros';
import { getMomentCurrentTimeEST } from '../util';
import { disconnectVoice, isInGuildVoice, joinVoice, playAudioFile } from '../voice';
import * as dotenv from 'dotenv';
dotenv.config();

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
            const voiceConnection = {
                channelId: newState.channel.id,
                guildId: newState.guild.id,
                adapterCreator: newState.guild.voiceAdapterCreator
            };
            joinVoice(voiceConnection, newState.client);
            playAudioFile(newState.guild.id, 'good_morning_donda', userId);
        }

        // Play user intro
        else {
            if (userId && userIntros[userId] && userIntros[userId]) {
                const voiceConnection = {
                    channelId: newState.channel.id,
                    guildId: newState.guild.id,
                    adapterCreator: newState.guild.voiceAdapterCreator
                };
                joinVoice(voiceConnection, newState.client);
                playAudioFile(newState.guild.id, userIntros[userId], userId);
            }
        }
        userIntros;
    }
    // User changes channels (not AFK channel)
    else if (oldState.guild.id === newState.guild.id && oldState.channelId && newState.channelId && oldState.channelId !== newState.guild.afkChannelId) {
        const userId = oldState.member?.id;
        if (userId && newState.channel && newState.channel.type === ChannelType.GuildVoice ) {
            timeInVoice.userChangeChannel(userId, newState.channelId);
        }
    }

    // Stop if user moves to AFK channel
    if (newState.guild.afkChannelId === newState.channelId) return;

    // Message when Azi leaves or chance when someone else leaves
    if ((newState.member?.id == process.env.AZI_ID || Math.random() < 0.10) && newState.channelId === null && oldState.guild.id === process.env.GUILD_ID) {
        // Get main channel
        const mainChannel = newState.client.channels.cache.get(process.env.MAIN_CHANNEL_ID ?? '');
        if (mainChannel && mainChannel.type === ChannelType.GuildText) {
            mainChannel.send('You made Azi leave.').catch(logError);
        }
    }

    // Play teleporting fat guy when moving between channels
    if (
        oldState.channelId && newState.channelId && oldState.channelId != newState.channelId &&
        oldState.member && oldState.member.roles.cache.some(role => role.name === 'FAT')
    ) {
        const voiceConnection = {
            channelId: newState.channelId,
            guildId: newState.guild.id,
            adapterCreator: newState.guild.voiceAdapterCreator
        };
        joinVoice(voiceConnection, newState.client);
        playAudioFile(newState.guild.id, 'teleporting_fat_guy_short', oldState.member?.user.id);
    }
};