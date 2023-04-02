import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getDisperseStreakHighscore } from '../sql/disperse-streak-highscore';

async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;
    const disperseStreak = await getDisperseStreakHighscore(interaction.guild.id);
    if (!disperseStreak) {
        void interaction.reply('No disperse streak highscore exists on this server.');
    }
    else {
        const userIds= disperseStreak.USER_IDS.split(',');
        const usernamesMap: {[key: string]: number} = {};
        for (const userId of userIds) {
            const username = (await interaction.client.users.fetch(userId)).username;
            usernamesMap[username] = usernamesMap[username]+1 || 1;
        }
        let usernames = '';
        for (const username in usernamesMap) {
            usernames += username;
            if (usernamesMap[username] > 1) usernames += `(${usernamesMap[username]})`;
            usernames += '\n';
        }
    
        const disperseHighscoreEmbed = new EmbedBuilder()
            .setTitle(`${interaction.guild.name}'s Disperse Streak Highscore`)
            .addFields(
                { name: 'Streak', value: `${disperseStreak.STREAK}`, inline: true },
                { name: 'Dispersers', value: `${usernames}`, inline: true }
            );
    
        void interaction.reply({ embeds: [disperseHighscoreEmbed] });
    }
}

const name = 'disperse-highscore';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Gets server\'s disperse streak highscore.');

export default { execute, name,  commandBuilder};
