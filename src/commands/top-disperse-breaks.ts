import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getTopDisperseStreakBreaks } from '../sql/disperse-streak-breaks';
import { fetchUser } from '../util';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const topDisperseStreakBreaks = await getTopDisperseStreakBreaks();
    if (topDisperseStreakBreaks.length) {
        let namesField = '';
        let dispersePercentField = '';
        let totalField = '';
        for (let i = 0; i < topDisperseStreakBreaks.length; i++) {
            const userId = topDisperseStreakBreaks[i].USER_ID;
            const username = (await fetchUser(interaction.client, userId)).username;
            namesField += `${i+1} . ${username}\n`;
            dispersePercentField += `${topDisperseStreakBreaks[i].BREAKS}\n`;
            totalField += `${topDisperseStreakBreaks[i].SCORE}\n`;
        }
        
        const rowDisperseRateEmbed = new EmbedBuilder()
            .setTitle('Top Disperse Streak Breaks')
            .addFields(
                { name: 'Name', value: namesField, inline: true },
                { name: '# of breaks', value: dispersePercentField, inline: true },
                { name: 'Sum of streaks broken', value: totalField, inline: true }
            );
        void interaction.editReply({ embeds: [rowDisperseRateEmbed] });
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