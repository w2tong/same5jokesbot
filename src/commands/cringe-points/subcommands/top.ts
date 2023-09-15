import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder, userMention } from 'discord.js';
import { getTopCringePoints, getUserCringePoints } from '../../../sql/tables/cringe-points';
import { MessageEmbedLimit, UsersPerEmbed, emptyEmbedFieldInline } from '../../../util/discordUtil';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const topCringePoints = await getTopCringePoints();
    if (topCringePoints.length) {
        const users = [];
        const points = [];
        let totalPoints = 0;
        for (const {USER_ID, POINTS} of topCringePoints) {
            users.push(userMention(USER_ID));
            points.push(POINTS.toLocaleString());
            totalPoints += POINTS;
        }
        const housePoints = await getUserCringePoints(process.env.CLIENT_ID ?? '') ?? 0;

        const embeds = [];
        for (let i = 0; i < users.length; i += UsersPerEmbed) {
            const endRange = i + UsersPerEmbed;
            const embed = new EmbedBuilder();

            if (i === 0) {
                embed
                    .setTitle('Top Cringe Points')
                    .addFields(
                        { name: 'House Points', value: housePoints.toLocaleString(), inline: true },
                        emptyEmbedFieldInline,
                        { name: 'Total Points', value: totalPoints.toLocaleString(), inline: true }
                    );
            }

            embed.addFields(
                { name: 'User', value: users.slice(i, endRange).join('\n'), inline: true },
                emptyEmbedFieldInline,
                { name: 'Points', value: points.slice(i, endRange).join('\n'), inline: true }
            );
            embeds.push(embed);
        }

        for (let i = 0; i < embeds.length; i += MessageEmbedLimit) {
            if (i === 0) {
                await interaction.editReply({ embeds: embeds.slice(i, i + MessageEmbedLimit) });
            }
            else {
                await interaction.followUp({ embeds: embeds.slice(i, i + MessageEmbedLimit) });
            }
        }
    }
    else {
        await interaction.editReply('No stats available.');
    }
}

const name = 'top';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Gets Cringe points of the top active users.');

export default { execute, name, subcommandBuilder };