import { ChannelType, Message } from 'discord.js';
import logger from '../logger';
import regexToAudio from '../regex-to-audio';
import regexToReact from '../regex-to-react';
import regexToText from '../regex-to-text';
import { joinVoice, playAudioFile } from '../voice';

export default (message: Message) => {
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
            const text = regexText.getText(message.member.id, command, message.member.displayName, message.member.guild.id);
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
        const audio = regexAudio.getAudio();
        if (regexAudio.regex.test(command) && audio && message.member && message.member.voice.channel && message.guild) {
            const voiceConnection = {
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator
            };
            joinVoice(voiceConnection, message.client);
            playAudioFile(message.guild.id, audio, message.member.user.username);
            break;
        }
    }
};
