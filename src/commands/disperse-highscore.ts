import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getDisperseStreakHighscore } from '../sql/disperse-streak-highscore';
import { fetchUser } from '../discordUtil';
import { convertDateToUnixTimestamp } from '../util';

async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;
    await interaction.deferReply();
    const disperseStreak = await getDisperseStreakHighscore(interaction.guild.id);
    if (disperseStreak) {
        const userIds= disperseStreak.USER_IDS.split(',');
        const usernamesMap: { [key: string]: number } = {};
        for (const userId of userIds) {
            const username = (await fetchUser(interaction.client.users, userId)).username;
            usernamesMap[username] = usernamesMap[username]+1 || 1;
        }
        let usernames = '';
        for (const username in usernamesMap) {
            usernames += username;
            if (usernamesMap[username] > 1) usernames += ` (${usernamesMap[username]})`;
            usernames += '\n';
        }
    
        const unixTimestamp = convertDateToUnixTimestamp(new Date(`${disperseStreak.STREAK_DATE} UTC`));
        const disperseHighscoreEmbed = new EmbedBuilder()
            .setTitle(`${interaction.guild.name}'s Disperse Streak Highscore <t:${unixTimestamp}:R>`)
            .addFields(
                { name: 'Streak', value: `${disperseStreak.STREAK}`, inline: true },
                { name: 'Dispersers', value: `${usernames}`, inline: true }
            );
    
        void interaction.editReply({ embeds: [disperseHighscoreEmbed] });
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
