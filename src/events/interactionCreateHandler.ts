import { EmbedBuilder, GuildMember, Interaction } from 'discord.js';
import logger from '../logger';
import { getDisperseStreakBreaks, getDisperseStreakHighscore, getGamersCounter } from '../oracledb';
import { joinVoice, playAudioFile } from '../voice';

const decimalPlaces = 2;

export default async (interaction: Interaction) => {
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
        interaction.reply({ content: reply, ephemeral: true }).catch((err: Error) => logger.error({
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
        interaction.reply(Math.floor(Math.random() * (max + 1 - min) + min).toString()).catch((err: Error) => logger.error({
            message: err.message,
            stack: err.stack
        }));
    }

    else if (commandName === 'get-disperse-breaks') {
        const disperseStreakBreaks = await getDisperseStreakBreaks(interaction.user.id);
        if (!disperseStreakBreaks) {
            interaction.reply('You have no streak breaks! Congratulations!').catch((err: Error) => logger.error({
                message: err.message,
                stack: err.stack
            }));
        }
        else {
            const reply = `${interaction.user.username}'s Disperse breaks count is **${disperseStreakBreaks.BREAKS}** and score is **${disperseStreakBreaks.SCORE}**.`;

            interaction.reply(reply).catch((err: Error) => logger.error({
                message: err.message,
                stack: err.stack
            }));
        }
    }

    else if (commandName === 'get-disperse-highscore') {
        if (!interaction.guild) return;
        const disperseStreak = await getDisperseStreakHighscore(interaction.guild.id);
        if (!disperseStreak) {
            interaction.reply('No disperse streak highscore exists on this server.').catch((err: Error) => logger.error({
                message: err.message,
                stack: err.stack
            }));
        }
        else {
            const username = (await interaction.client.users.fetch(disperseStreak.USER_ID)).username;
            const reply = `${interaction.guild.name}'s highest Disperse streak is ***${disperseStreak.STREAK}*** by **${username}**.`;

            interaction.reply(reply).catch((err: Error) => logger.error({
                message: err.message,
                stack: err.stack
            }));
        }
    }

    else if (commandName === 'get-gamers-stats') {
        const gamerCounter = await getGamersCounter(interaction.user.id);
        if (!gamerCounter) {
            interaction.reply('No stats available.').catch((err: Error) => logger.error({
                message: err.message,
                stack: err.stack
            }));
        }
        else {
            
            const sum = gamerCounter.DISCHARGE + gamerCounter.DISPERSE + gamerCounter.RISE_UP;
            const dischargePercent = (gamerCounter.DISCHARGE / sum * 100).toFixed(decimalPlaces);
            const dispersePercent = (gamerCounter.DISPERSE / sum * 100).toFixed(decimalPlaces);
            const riseUpPercent = (gamerCounter.RISE_UP / sum * 100).toFixed(decimalPlaces);
            const gamersStatsEmbed = new EmbedBuilder()
                .setTitle(`${interaction.user.username}'s Gamers Stats`)
                .addFields(
                    { name: 'Gamers', value: 'Discharge!\nDisperse!\nRise up!', inline: true },
                    { name: 'Hits', value: `${gamerCounter.DISCHARGE}\n${gamerCounter.DISPERSE}\n${gamerCounter.RISE_UP}`, inline: true },
                    { name: 'Hit Rate', value: `${dischargePercent}%\n${dispersePercent}%\n${riseUpPercent}%`, inline: true },
                );
            interaction.reply({ embeds: [gamersStatsEmbed]}).catch((err: Error) => logger.error({
                message: err.message,
                stack: err.stack
            }));
        }
    }
};