import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder, userMention } from 'discord.js';
import { getTopCringePoints } from '../../../sql/tables/cringe-points';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const topCringePoints = await getTopCringePoints();
    if (topCringePoints.length) {
        const users = [];
        const points = [];
        for (const {USER_ID, POINTS} of topCringePoints) {
            users.push(userMention(USER_ID));
            points.push(POINTS.toLocaleString());
        }

        const usersFieldValue = users.join('\n');
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

const name = 'top';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Gets cringe points of the top active users.');

export default { execute, name, subcommandBuilder };