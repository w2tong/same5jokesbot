import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getCurrentDisperseStreak } from '../sql/current-disperse-streak';
import { convertDateToUnixTimestamp, fetchUser } from '../util';

async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;
    await interaction.deferReply();
    const currentDisperseStreak = await getCurrentDisperseStreak(interaction.guild.id);
    if (currentDisperseStreak) {
        const userIds = currentDisperseStreak.USER_IDS.split(',');
        let usernames = '';
        if (currentDisperseStreak.STREAK > 0) {
            const usernamesMap: { [key: string]: number } = {};
            for (const userId of userIds) {
                const username = (await fetchUser(interaction.client, userId)).username;
                usernamesMap[username] = usernamesMap[username]+1 || 1;
            }
            for (const username in usernamesMap) {
                usernames += username;
                if (usernamesMap[username] > 1) usernames += ` (${usernamesMap[username]})`;
                usernames += '\n';
            }
        }
        else {
            usernames = 'None';
        }
    
        const unixTimestamp = convertDateToUnixTimestamp(new Date(`${currentDisperseStreak.STREAK_DATE} UTC`));
        const currentDisperseStreakEmbed = new EmbedBuilder()
            .setTitle(`${interaction.guild.name}'s Current Disperse Streak <t:${unixTimestamp}:R>`)
            .addFields(
                { name: 'Streak', value: `${currentDisperseStreak.STREAK}`, inline: true },
                { name: 'Dispersers', value: `${usernames}`, inline: true }
            );
    
        void interaction.editReply({ embeds: [currentDisperseStreakEmbed] });
    }
    else {
        void interaction.editReply('No disperse streak exists on this server.');
    }
}

const name = 'current-disperse-streak';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Gets server\'s current disperse streak.');

export default { execute, name,  commandBuilder};
