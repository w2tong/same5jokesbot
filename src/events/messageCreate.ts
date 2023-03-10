import { ChannelType, Events, Message } from 'discord.js'
import regexToAudio from '../regex-to-audio';
import regexToReact from '../regex-to-react';
import regexToText from '../regex-to-text';
import { createPlayer, createVoiceConnection, playAudioFile } from '../voice';

export default async function execute(message: Message) {
    // Don't respond to bots
    if (message.author.bot) return;
    // Don't respond to Bot Abuser role
    if (message.member && message.member.roles.cache.some(role => role.name === 'Bot Abuser')) return;
    // Return if incorrect channel type
    if (message.channel.type !== ChannelType.GuildText) return;

    const command = message.content.toLowerCase();

    //React with emoji
    for (const regexReact of regexToReact) {
        const react = regexReact.getReact()
        if (react && regexReact.regex.test(command)) {
            message.react(react);
        }
    }
    // Text replies
    let botMessage = '';
    for (let regexText of regexToText) {
        if (regexText.regex.test(command) && message.member) {
            const text = regexText.getText(command, message.member?.displayName);
            botMessage += `${text}\n`;
        }
    }
    // Send message
    if (botMessage) {
        message.channel.send(botMessage).catch((e) => console.log(`Error sending message: ${e}`));;
    }
    // Audio replies
    for (let regexAudio of regexToAudio) {
        const audio = regexAudio.getAudio();
        if (regexAudio.regex.test(command) && audio && message.member && message.member.voice.channel && message.guild) {
            const voiceConnection = {
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
                selfDeaf: false
            }
            const player = createPlayer();
            const connection = createVoiceConnection(voiceConnection, player, message.client);
            await playAudioFile(connection, player, audio, message.member.user.username);
            break;
        }
    }
}
