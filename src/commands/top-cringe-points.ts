import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getTopCringePoints } from '../sql/cringe-points';
import { fetchUser } from '../util';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const topCringePoints = await getTopCringePoints();
    if (topCringePoints.length) {
        let namesField = '';
        let pointsField = '';
        for (let i = 0; i < topCringePoints.length; i++) {
            const userId = topCringePoints[i].USER_ID;
            const username = (await fetchUser(interaction.client.users, userId)).username;
            namesField += `${i+1} . ${username}\n`;
            pointsField += `${topCringePoints[i].POINTS}\n`;
        }
        
        const rowCringePointsEmbed = new EmbedBuilder()
            .setTitle('Top Cringe Points')
            .addFields(
                { name: 'Name', value: namesField, inline: true },
                { name: 'Points', value: pointsField, inline: true }
            );
        void interaction.editReply({ embeds: [rowCringePointsEmbed] });
    }
    else {
        void interaction.editReply('No stats available.');
    }
}

const name = 'top-cringe-points';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Gets cringe points of top 10 users.');

export default { execute, name, commandBuilder };