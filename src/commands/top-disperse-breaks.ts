import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getTopDisperseStreakBreaks } from '../sql/tables/disperse-streak-breaks';
import { createUserNumberedList, fetchUser } from '../discordUtil';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const topDisperseStreakBreaks = await getTopDisperseStreakBreaks();
    if (topDisperseStreakBreaks.length) {
        const users = [];
        const breaks = [];
        const scores = [];
        for (const {USER_ID, BREAKS, SCORE} of topDisperseStreakBreaks) {
            users.push(fetchUser(interaction.client.users, USER_ID));
            breaks.push(BREAKS);
            scores.push(SCORE);
        }
        const userFieldValue = await createUserNumberedList(users);
        const breaksFieldValue = breaks.join('\n');
        const scoresFieldValue = scores.join('\n');
        
        const embed = new EmbedBuilder()
            .setTitle('Top Disperse Streak Breaks')
            .addFields(
                { name: 'User', value: userFieldValue, inline: true },
                { name: '# of breaks', value: breaksFieldValue, inline: true },
                { name: 'Sum of streaks broken', value: scoresFieldValue, inline: true }
            );
        void interaction.editReply({ embeds: [embed] });
    }
    else {
        void interaction.editReply('No stats available.');
    }
}

const name = 'top-disperse-breaks';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Gets streak breaks of all users.');

export default { execute, name, commandBuilder };