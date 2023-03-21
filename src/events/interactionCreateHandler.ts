import { GuildMember, Interaction } from 'discord.js';
import { joinVoice, playAudioFile } from '../voice';
import { loggers } from 'winston';

const logger = loggers.get('error-logger');

export default (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;
    // Play audio
    if (commandName === 'play' && interaction.member instanceof GuildMember && interaction.guild && interaction.member.voice.channel) {
        const voiceConnection = {
            channelId: interaction.member.voice.channel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator
        };
        const audioFile = interaction.options.getString('audio') ?? '';
        const reply = interaction.member.voice ? `Playing ${audioFile}.` : 'You are not in a voice channel.';
        interaction.reply({ content: reply, ephemeral: true }).catch((err: Error) => logger.log({
            level: 'error',
            message: err.message,
            stack: err.stack
        }));
        joinVoice(voiceConnection, interaction.client);
        playAudioFile(interaction.guild.id, audioFile, interaction.member.user.username);
    }
    // Reply with a number between 1 and 100 (or min and max)
    else if (commandName === 'roll') {
        const min = interaction.options.getInteger('min') ?? 1;
        const max = interaction.options.getInteger('max') ?? 100;
        interaction.reply(Math.floor(Math.random() * (max + 1 - min) + min).toString()).catch((err: Error) => logger.log({
            level: 'error',
            message: err.message,
            stack: err.stack
        }));
    }
};