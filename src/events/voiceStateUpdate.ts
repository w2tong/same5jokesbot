import { ChannelType, VoiceState } from 'discord.js';
import timeInVoice from '../timeInVoice';
import { getMomentTorontoCurrentTime } from '../util/util';
import { disconnectVoice, isInGuildVoice, joinVoicePlayAudio } from '../voice';
import * as dotenv from 'dotenv';
import audio from '../util/audioFileMap';
import { getUserIntro } from '../sql/tables/user_intro';
dotenv.config();

export default async (oldState: VoiceState, newState: VoiceState) => {

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
        if (!userId) return;
        
        // Add user join time
        timeInVoice.userJoin(userId, newState.channelId, newState.guild.id);

        // Play Good Morning Donda when joining channel in the morning
        const hour = getMomentTorontoCurrentTime().hour();
        if (hour >= 6 && hour < 12 && userId) {
            joinVoicePlayAudio(newState, audio.goodMorningDonda);
        }

        // Play user intro
        else {
            const intro = await getUserIntro(userId);
            if (intro) joinVoicePlayAudio(newState, intro);
        }
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

    // Play teleporting fat guy when moving between channels
    if (
        oldState.channelId && newState.channelId && oldState.channelId != newState.channelId &&
        oldState.member && oldState.member.roles.cache.some(role => role.id === process.env.FAT_ROLE_ID)
    ) {
        joinVoicePlayAudio(newState, audio.teleportingFatGuyShort);
    }
};