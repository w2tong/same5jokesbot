import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getDisperseStreakHighscore } from '../sql/tables/disperse-streak-highscore';
import { createDispersersList } from '../discordUtil';
import { convertDateToUnixTimestamp } from '../util';

async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;
    await interaction.deferReply();
    const disperseStreak = await getDisperseStreakHighscore(interaction.guild.id);
    if (disperseStreak) {
        const dispersersFieldValue = await createDispersersList(disperseStreak.USER_IDS, interaction.client.users);
    
        const unixTimestamp = convertDateToUnixTimestamp(new Date(`${disperseStreak.STREAK_DATE} UTC`));
        const embed = new EmbedBuilder()
            .setTitle(`${interaction.guild.name}'s Disperse Streak Highscore <t:${unixTimestamp}:R>`)
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

const name = 'disperse-highscore';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Gets server\'s disperse streak highscore.');

export default { execute, name,  commandBuilder};
