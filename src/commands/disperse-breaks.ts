import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import logger from '../logger';
import { getDisperseStreakBreaks } from '../sql/disperse-streak-breaks';

async function execute(interaction: ChatInputCommandInteraction) {
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

const name = 'disperse-breaks';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Gets your stats on disperse streak breaks.');

export default {execute, name, commandBuilder};