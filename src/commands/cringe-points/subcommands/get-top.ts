import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { getTopCringePoints } from '../../../sql/tables/cringe-points';
import { createUserNumberedList, fetchUser } from '../../../discordUtil';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const topCringePoints = await getTopCringePoints();
    if (topCringePoints.length) {
        const users = [];
        const points = [];
        for (const {USER_ID, POINTS} of topCringePoints) {
            users.push(fetchUser(interaction.client.users, USER_ID));
            points.push(POINTS);
        }

        const usersFieldValue = await createUserNumberedList(users);
        const pointsFieldValue = points.join('\n');
        const rowCringePointsEmbed = new EmbedBuilder()
            .setTitle('Top Cringe Points')
            .addFields(
                { name: 'User', value: usersFieldValue, inline: true },
                { name: 'Points', value: pointsFieldValue, inline: true }
            );
        void interaction.editReply({ embeds: [rowCringePointsEmbed] });
    }
    else {
        void interaction.editReply('No stats available.');
    }
}

const name = 'get-top';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Gets cringe points of top 10 users.');

export default { execute, name, subcommandBuilder };