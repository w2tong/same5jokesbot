import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { getDisperseStreakBreaks } from '../../../sql/tables/disperse_streak_breaks';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const disperseStreakBreaks = await getDisperseStreakBreaks(interaction.user.id);
    if (disperseStreakBreaks) {
        const disperseBreaksEmbed = new EmbedBuilder()
            .setTitle(`${interaction.user.username}'s Disperse Breaks`)
            .addFields(
                { name: '# of breaks', value: `${disperseStreakBreaks.BREAKS}`, inline: true },
                { name: 'Sum of streaks broken', value: `${disperseStreakBreaks.SCORE}`, inline: true }
            );
        void interaction.editReply({ embeds: [disperseBreaksEmbed] });
    }
    else {
        void interaction.editReply('You have no streak breaks! Congratulations!');
    }
}

const name = 'breaks';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Gets your stats on disperse streak breaks.');

export default {execute, name, subcommandBuilder};