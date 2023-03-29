import { ChannelType, Message } from 'discord.js';
import logger from '../logger';
import regexToAudio from '../regex-responses/audio';
import regexToReact from '../regex-responses/react';
import regexToText from '../regex-responses/text';
import { joinVoice, playAudioFile } from '../voice';

export default async (message: Message) => {
    // Don't respond to bots
    if (message.author.bot) return;
    // Don't respond to Bot Abuser role
    if (message.member && message.member.roles.cache.some(role => role.name === 'Bot Abuser')) return;
    // Return if incorrect channel type
    if (message.channel.type !== ChannelType.GuildText) return;

    const command = message.content.toLowerCase();

    //React with emoji
    for (const regexReact of regexToReact) {
        const react = regexReact.getReact();
        if (react && regexReact.regex.test(command)) {
            message.react(react).catch((err: Error) => logger.error({
                message: err.message,
                stack: err.stack
            }));
        }
    }
    // Text replies
    let botMessage = '';
    for (const regexText of regexToText) {
        if (regexText.regex.test(command) && message.member) {
            const text = await regexText.getText(message.member.id, command, message.member.displayName, message.member.guild.id);
            botMessage += `${text}\n`;
        }
    }
    // Send message
    if (botMessage) {
        message.channel.send(botMessage).catch((err: Error) => logger.error({
            message: err.message,
            stack: err.stack
        }));
    }
    // Audio replies
    for (const regexAudio of regexToAudio) {
        if (regexAudio.regex.test(command) && message.member && message.member.voice.channel && message.guild) {
            const audio = regexAudio.getAudio(message.author.id);
            const voiceConnection = {
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator
            };
            joinVoice(voiceConnection, message.client);
            playAudioFile(message.guild.id, audio, message.author.username);
            break;
        }
    }
};
