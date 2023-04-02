import { ChannelType, Message } from 'discord.js';
import { logError } from '../logger';
import getAudioResponse from '../regex-responses/audio';
import getReactResponse from '../regex-responses/react';
import getTextResponse from '../regex-responses/text';
import { joinVoice, playAudioFile } from '../voice';

export default async (message: Message) => {
    // Don't respond to bots
    if (message.author.bot) return;
    // Don't respond to Bot Abuser role
    if (message.member && message.member.roles.cache.some(role => role.name === 'Bot Abuser')) return;
    // Return if incorrect channel type
    if (message.channel.type !== ChannelType.GuildText) return;

    const command = message.content.toLowerCase();

    // Get text response and send message
    if (message.guildId) {
        const botMessage = await getTextResponse(command, message.author.id, message.author.username, message.guildId);
        if (botMessage) {
            message.channel.send(botMessage).catch(logError);
        }
    }

    //Get emoji and react to message
    const react = getReactResponse(command);
    if (react) {
        message.react(react).catch(logError);
    }

    // Audio replies
    if (message.member && message.member.voice.channel && message.guild) {
        const audio = getAudioResponse(command, message.author.id);
        if (audio) {
            const voiceConnection = {
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator
            };
            joinVoice(voiceConnection, message.client);
            playAudioFile(message.guild.id, audio, message.author.username);
        }
    }
};
