import { ChannelType, Message } from 'discord.js';
import getAudioResponse from '../regex-responses/audio';
import getImageResponse from '../regex-responses/image';
import getReactResponse from '../regex-responses/react';
import getTextResponse from '../regex-responses/text';
import { joinVoicePlayAudio } from '../voice';
import { RewardCooldown } from '../cooldown';
import { timeInMS } from '../util/util';

const textRewardCooldown = new RewardCooldown(60 * timeInMS.second, 100);
const reactRewardCooldown = new RewardCooldown(1 * timeInMS.hour, 1000);

export default async (message: Message) => {
    // Don't respond to bots
    if (message.author.bot) return;
    // Return if incorrect channel type
    if (message.channel.type !== ChannelType.GuildText) return;

    const command = message.content.toLowerCase();

    // Get text response and send message
    if (message.guildId) {
        const botMessage = await getTextResponse(command, message.author.id, message.author.username, message.guildId);
        const images = getImageResponse(command);
        if (botMessage) {
            message.channel.send({content: botMessage, files: images}).catch(console.error);
            if (message.member?.id) textRewardCooldown.reward(message.member.id).catch(console.error);
        }
    }

    //Get emoji and react to message
    const react = getReactResponse(command);
    if (react) {
        message.react(react).catch(console.error);
        if (message.member?.id) reactRewardCooldown.reward(message.member.id).catch(console.error);
    }

    // Audio replies
    if (message.member && message.member.voice.channel && message.guild) {
        const audio = getAudioResponse(command);
        if (audio) {
            joinVoicePlayAudio(message, audio);
        }
    }
};
