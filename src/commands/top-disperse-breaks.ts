import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import logger from '../logger';
import { getTopDisperseStreakBreaks } from '../sql/oracledb';

async function execute(interaction: ChatInputCommandInteraction) {
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

const name = 'top-disperse-breaks';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Gets streak breaks of all users.');

export default { execute, name, commandBuilder };