import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder, time } from 'discord.js';
import { getCurrentDisperseStreak } from '../../../sql/tables/current-disperse-streak';
import { createDispersersList } from '../../../util/discordUtil';

async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;
    await interaction.deferReply();
    const disperseStreak = await getCurrentDisperseStreak(interaction.guild.id);
    if (disperseStreak) {
        let dispersersFieldValue = 'None';
        if (disperseStreak.STREAK > 0) {
            dispersersFieldValue = await createDispersersList(disperseStreak.USER_IDS, interaction.client.users);
        }
        const embed = new EmbedBuilder()
            .setTitle(`${interaction.guild.name}'s Current Disperse Streak ${time(new Date(`${disperseStreak.STREAK_DATE} UTC`), 'R')}`)
            .addFields(
                { name: 'Streak', value: `${disperseStreak.STREAK}`, inline: true },
                { name: 'Dispersers', value: `${dispersersFieldValue}`, inline: true }
            );
    
        void interaction.editReply({ embeds: [embed] });
    }
    else {
        void interaction.editReply('No disperse streak exists on this server.');
    }
}

const name = 'current-streak';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Gets server\'s current disperse streak.');

export default { execute, name, subcommandBuilder};
