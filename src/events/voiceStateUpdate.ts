import { ChannelType, VoiceState } from 'discord.js';
import { logError } from '../logger';
import { getMomentCurrentTimeEST } from '../util';
import { disconnectVoice, joinVoice, playAudioFile } from '../voice';
import * as dotenv from 'dotenv';
dotenv.config();

export default (oldState: VoiceState, newState: VoiceState) => {

    // Stop if user is a bot
    if (oldState.member?.user.bot) return;

    // Disconnect if users in current bot channel disconnect or move to AFK channel
    if ((newState.channelId === null || newState.guild.afkChannelId === newState.channelId) && (oldState.channel?.members.size === 0 || (oldState.channel?.members.size === 1 && process.env.CLIENT_ID && oldState.channel?.members.has(process.env.CLIENT_ID)))) {
        disconnectVoice(oldState.guild.id);
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

    // Stop if voice state update is itself
    if (oldState.id === newState.client.user?.id) return;

    // Play teleporting fat guy when moving between channels
    if (oldState.channelId && newState.channelId && oldState.channelId != newState.channelId) {
        const voiceConnection = {
            channelId: newState.channelId,
            guildId: newState.guild.id,
            adapterCreator: newState.guild.voiceAdapterCreator
        };
        joinVoice(voiceConnection, newState.client);
        playAudioFile(newState.guild.id, 'teleporting_fat_guy_short', oldState.member?.user.username);
    }

    // Play Good Morning Donda when joining channel in the morning
    if (newState.channelId && oldState.channelId === null) {
        const hour = getMomentCurrentTimeEST().utc().tz('America/Toronto').hour();
        if (hour >= 4 && hour < 12) {
            const voiceConnection = {
                channelId: newState.channelId,
                guildId: newState.guild.id,
                adapterCreator: newState.guild.voiceAdapterCreator
            };
            joinVoice(voiceConnection, newState.client);
            playAudioFile(newState.guild.id, 'good_morning_donda', oldState.member?.user.username);
        }
    }
};