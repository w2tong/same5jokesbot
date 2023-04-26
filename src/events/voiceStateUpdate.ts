import { ChannelType, VoiceState } from 'discord.js';
import { logError } from '../logger';
import userIntros from './user-intros';
import { getMomentCurrentTimeEST } from '../util';
import { disconnectVoice, isInGuildVoice, joinVoice, playAudioFile } from '../voice';
import * as dotenv from 'dotenv';
import { updateTimeInVoice } from '../sql/time-in-voice';
dotenv.config();

const userJoinTime: {[key:string]: number} = {};

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
        if (userId && userJoinTime[userId]) {
            const date = new Date(userJoinTime[userId]).toISOString().slice(0, 10);
            void updateTimeInVoice(userId, newState.guild.id, date, Date.now() - userJoinTime[userId]);
            delete userJoinTime[userId];
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
        playAudioFile(newState.guild.id, 'teleporting_fat_guy_short', oldState.member?.user.username);
    }

    // User joins voice channel
    if (newState.channelId && oldState.channelId === null) {
        const userId = oldState.member?.id;
        
        // Add user join time
        if (userId) {
            userJoinTime[userId] = Date.now();
        }
        

        // Play Good Morning Donda when joining channel in the morning
        const hour = getMomentCurrentTimeEST().utc().tz('America/Toronto').hour();
        if (hour >= 6 && hour < 12) {
            const voiceConnection = {
                channelId: newState.channelId,
                guildId: newState.guild.id,
                adapterCreator: newState.guild.voiceAdapterCreator
            };
            joinVoice(voiceConnection, newState.client);
            playAudioFile(newState.guild.id, 'good_morning_donda', oldState.member?.user.username);
        }

        // Play user intro
        else {
            if (userId && userIntros[userId] && userIntros[userId]) {
                const voiceConnection = {
                    channelId: newState.channelId,
                    guildId: newState.guild.id,
                    adapterCreator: newState.guild.voiceAdapterCreator
                };
                joinVoice(voiceConnection, newState.client);
                playAudioFile(newState.guild.id, userIntros[userId], oldState.member?.user.username);
            }
        }
        userIntros;
    }
};