import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, userMention } from 'discord.js';
import { fetchUser } from '../util/discordUtil';
import { getUserCringePoints, updateCringePoints } from '../sql/tables/cringe-points';

const price = 1_000_000;

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ephemeral: true});
    const user = interaction.user;
    const type = interaction.options.getString('type');
    const details = interaction.options.getString('details');
    if (!type || !details || !process.env.OWNER_USER_ID || !process.env.CLIENT_ID) {
        await interaction.editReply('There was an error processing your request.');
        return;
    }

    const points = await getUserCringePoints(user.id) ?? 0;
    if (points < price) {
        await interaction.editReply(`You do not have enough points (you have ${points}, you need ${(price-points).toLocaleString()} more).`);
        return;
    }

    const embed = new EmbedBuilder()
        .setTitle(`${user.username}'s ${type} request`)
        .addFields(
            {name: 'User', value: `${userMention(interaction.user.id)}`, inline: true},
            {name: 'Type', value: `${type}`, inline: true},
            {name: 'Request', value: `${details}`},
            {name: 'Balance', value: `${points.toLocaleString()} (-${price.toLocaleString()})`, inline: true},
            {name: 'New Balance', value: `${(points-price).toLocaleString()}`, inline: true}
        );

    const owner = await fetchUser(interaction.client.users, process.env.OWNER_USER_ID);
    await owner.send({embeds: [embed]});
    await interaction.editReply({embeds: [embed]});
    await updateCringePoints([{userId: user.id, points: -price}, {userId: process.env.CLIENT_ID, points: price}]);
}

const name = 'request';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription(`Request a feature. Price: ${price.toLocaleString()} points.`)
    .addStringOption((option) => option
        .setName('link')
        .setDescription('Enter the link and timestamp of the audio you want.')
        .setRequired(true)
    )
    .addStringOption((option) => option
        .setName('prompt')
        .setDescription('Enter the prompt that plays audio.')
        .setRequired(true)
    );

export default { execute, name, commandBuilder };