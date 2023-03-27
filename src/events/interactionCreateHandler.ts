import { EmbedBuilder, GuildMember, Interaction } from 'discord.js';
import logger from '../logger';
import { getDisperseStreakBreaks, getDisperseStreakHighscore, getGamersCounter, getKnitCount, getSneezeCount, getTopDisperseRate, getTopDisperseStreakBreaks } from '../sql/oracledb';
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
        playAudioFile(interaction.guild.id, audioFile, interaction.user.username);
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

    else if (commandName === 'disperse-breaks') {
        const disperseStreakBreaks = await getDisperseStreakBreaks(interaction.user.id);
        if (!disperseStreakBreaks) {
            interaction.reply('You have no streak breaks! Congratulations!').catch((err: Error) => logger.error({
                message: err.message,
                stack: err.stack
            }));
        }
        else {
            const disperseBreaksEmbed = new EmbedBuilder()
                .setTitle(`${interaction.user.username}'s Disperse Breaks`)
                .addFields(
                    { name: '# of breaks', value: `${disperseStreakBreaks.BREAKS}`, inline: true },
                    { name: 'Sum of streaks broken', value: `${disperseStreakBreaks.SCORE}`, inline: true }
                );
            interaction.reply({ embeds: [disperseBreaksEmbed] }).catch((err: Error) => logger.error({
                message: err.message,
                stack: err.stack
            }));
        }
    }

    else if (commandName === 'disperse-highscore') {
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
            const disperseHighscoreEmbed = new EmbedBuilder()
                .setTitle(`${interaction.guild.name}'s Disperse Streak Highscore`)
                .addFields(
                    { name: 'Streak', value: `${disperseStreak.STREAK}`, inline: true },
                    { name: 'Record Holder', value: `${username}`, inline: true }
                );

            interaction.reply({ embeds: [disperseHighscoreEmbed] }).catch((err: Error) => logger.error({
                message: err.message,
                stack: err.stack
            }));
        }
    }

    else if (commandName === 'gamers-stats') {
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
                    { name: 'Hit Rate', value: `${dischargePercent}%\n${dispersePercent}%\n${riseUpPercent}%`, inline: true }
                );
            interaction.reply({ embeds: [gamersStatsEmbed] }).catch((err: Error) => logger.error({
                message: err.message,
                stack: err.stack
            }));
        }
    }

    else if (commandName === 'top-disperse-rate') {
        const topDisperseRate = await getTopDisperseRate();
        if (topDisperseRate.length === 0) {
            interaction.reply('No stats available.').catch((err: Error) => logger.error({
                message: err.message,
                stack: err.stack
            }));
        }
        else {
            let namesField = '';
            let dispersePercentField = '';
            let totalField = '';
            for (let i = 0; i < topDisperseRate.length; i++) {
                namesField += `${i+1}. ${(await interaction.client.users.fetch(topDisperseRate[i].USER_ID)).username}\n`;
                dispersePercentField += `${topDisperseRate[i].DISPERSE_PC.toFixed(2)}%\n`;
                totalField += `${topDisperseRate[i].SUM}\n`;
            }
            
            const rowDisperseRateEmbed = new EmbedBuilder()
                .setTitle('Top Disperse Rates')
                .addFields(
                    { name: 'Name', value: namesField, inline: true },
                    { name: 'Disperse %', value: dispersePercentField, inline: true },
                    { name: 'Gamers Total', value: totalField, inline: true }
                );
            interaction.reply({ embeds: [rowDisperseRateEmbed] }).catch((err: Error) => logger.error({
                message: err.message,
                stack: err.stack
            }));
        }
    }

    else if (commandName === 'top-disperse-streak-breaks') {
        const topDisperseStreakBreaks = await getTopDisperseStreakBreaks();
        if (topDisperseStreakBreaks.length === 0) {
            interaction.reply('No stats available.').catch((err: Error) => logger.error({
                message: err.message,
                stack: err.stack
            }));
        }
        else {
            let namesField = '';
            let dispersePercentField = '';
            let totalField = '';
            for (let i = 0; i < topDisperseStreakBreaks.length; i++) {
                namesField += `${i+1}. ${(await interaction.client.users.fetch(topDisperseStreakBreaks[i].USER_ID)).username}\n`;
                dispersePercentField += `${topDisperseStreakBreaks[i].BREAKS}\n`;
                totalField += `${topDisperseStreakBreaks[i].SCORE}\n`;
            }
            
            const rowDisperseRateEmbed = new EmbedBuilder()
                .setTitle('Top Disperse Streak Breaks')
                .addFields(
                    { name: 'Name', value: namesField, inline: true },
                    { name: '# of breaks', value: dispersePercentField, inline: true },
                    { name: 'Sum of streaks broken', value: totalField, inline: true }
                );
            interaction.reply({ embeds: [rowDisperseRateEmbed] }).catch((err: Error) => logger.error({
                message: err.message,
                stack: err.stack
            }));
        }
    }

    else if (commandName === 'knit-count') {
        let knits = 0;
        const knitCount = await getKnitCount(interaction.user.id);
        if (knitCount) {
            knits = knitCount.COUNT;
        }
        interaction.reply(`**${knits}** knits.`).catch((err: Error) => logger.error({
            message: err.message,
            stack: err.stack
        }));
    }

    else if (commandName === 'sneeze-count') {
        let sneezes = 0;
        const sneezeCount = await getSneezeCount(interaction.user.id);
        if (sneezeCount) {
            sneezes = sneezeCount.COUNT;
        }
        interaction.reply(`**${sneezes}** sneezes.`).catch((err: Error) => logger.error({
            message: err.message,
            stack: err.stack
        }));
    }
};