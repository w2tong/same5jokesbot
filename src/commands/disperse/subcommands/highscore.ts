import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder, time } from 'discord.js';
import { getDisperseStreakHighscore } from '../../../sql/tables/disperse_streak_highscore';
import { createDispersersList } from '../../../util/discordUtil';

async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;
    await interaction.deferReply();
    const disperseStreak = await getDisperseStreakHighscore(interaction.guild.id);
    if (disperseStreak) {
        const dispersersFieldValue = createDispersersList(disperseStreak.USER_IDS);
    
        const embed = new EmbedBuilder()
            .setTitle(`${interaction.guild.name}'s Disperse Streak Highscore ${time(new Date(`${disperseStreak.STREAK_DATE} UTC`), 'R')}`)
            .addFields(
                { name: 'Streak', value: `${disperseStreak.STREAK}`, inline: true },
                { name: 'Dispersers', value: `${dispersersFieldValue}`, inline: true }
            );
    
        void interaction.editReply({ embeds: [embed] });
    }
    else {
        
        void interaction.editReply('No disperse streak highscore exists on this server.');
    }
}

const name = 'highscore';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Gets server\'s disperse streak highscore.');

export default { execute, name,  subcommandBuilder};
