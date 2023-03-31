import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import logger from '../logger';
import { getCurrentDisperseStreak } from '../sql/current-disperse-streak';

async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;
    const currentDisperseStreak = await getCurrentDisperseStreak(interaction.guild.id);
    if (!currentDisperseStreak) {
        interaction.reply('No disperse streak exists on this server.').catch((err: Error) => logger.error({
            message: err.message,
            stack: err.stack
        }));
    }
    else {
        const userIds = currentDisperseStreak.USER_IDS.split(',');
        let usernames = '';
        if (currentDisperseStreak.STREAK > 0) {
            const usernamesMap: {[key: string]: number} = {};
            for (const userId of userIds) {
                const username = (await interaction.client.users.fetch(userId)).username;
                usernamesMap[username] = usernamesMap[username]+1 || 1;
            }
            for (const username in usernamesMap) {
                usernames += username;
                if (usernamesMap[username] > 1) usernames += `(${usernamesMap[username]})`;
                usernames += '\n';
            }
        }
        else {
            usernames = 'None';
        }

        const currentDisperseStreakEmbed = new EmbedBuilder()
            .setTitle(`${interaction.guild.name}'s Current Disperse Streak`)
            .addFields(
                { name: 'Streak', value: `${currentDisperseStreak.STREAK}`, inline: true },
                { name: 'Dispersers', value: `${usernames}`, inline: true }
            );

        interaction.reply({ embeds: [currentDisperseStreakEmbed] }).catch((err: Error) => logger.error({
            message: err.message,
            stack: err.stack
        }));
    }
}

const name = 'current-disperse-streak';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Gets server\'s current disperse streak.');

export default { execute, name,  commandBuilder};
