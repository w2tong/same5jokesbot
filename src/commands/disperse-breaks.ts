import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getDisperseStreakBreaks } from '../sql/disperse-streak-breaks';

async function execute(interaction: ChatInputCommandInteraction) {
    const disperseStreakBreaks = await getDisperseStreakBreaks(interaction.user.id);
    if (!disperseStreakBreaks) {
        void interaction.reply('You have no streak breaks! Congratulations!');
    }
    else {
        const disperseBreaksEmbed = new EmbedBuilder()
            .setTitle(`${interaction.user.username}'s Disperse Breaks`)
            .addFields(
                { name: '# of breaks', value: `${disperseStreakBreaks.BREAKS}`, inline: true },
                { name: 'Sum of streaks broken', value: `${disperseStreakBreaks.SCORE}`, inline: true }
            );
        void interaction.reply({ embeds: [disperseBreaksEmbed] });
    }
}

const name = 'disperse-breaks';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Gets your stats on disperse streak breaks.');

export default {execute, name, commandBuilder};