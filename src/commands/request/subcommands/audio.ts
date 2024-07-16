import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder, userMention } from 'discord.js';
import { emptyEmbedField, fetchUser } from '../../../util/discordUtil';
import { getUserCringePoints, updateCringePoints } from '../../../sql/tables/cringe_points';
import { audio, fetchAudioRequestPrice } from '../requestManager';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ephemeral: true});
    const user = interaction.user;
    const link = interaction.options.getString('link');
    const prompt = interaction.options.getString('prompt');
    if (!link || !prompt || !process.env.OWNER_USER_ID || !process.env.CLIENT_ID) {
        await interaction.editReply('There was an error processing your request.');
        return;
    }

    const points = await getUserCringePoints(user.id) ?? 0;
    const price = await fetchAudioRequestPrice();
    if (points < price) {
        await interaction.editReply(`You do not have enough points (you have ${points}, you need ${(price-points).toLocaleString()} more).`);
        return;
    }

    const embed = new EmbedBuilder()
        .setAuthor({name: `${user.username}'s Audio request`, iconURL: user.displayAvatarURL()})
        .addFields(
            {name: 'User', value: `${userMention(interaction.user.id)}`, inline: true},
            {name: 'Type', value: 'Audio', inline: true},

            {name: 'Link', value: `${link}`},

            {name: 'Prompt', value: `${prompt}`},

            emptyEmbedField,
            
            {name: 'Balance', value: `${points.toLocaleString()} (-${price.toLocaleString()})`, inline: true},
            {name: 'New Balance', value: `${(points-price).toLocaleString()}`, inline: true}
        );

    const owner = await fetchUser(interaction.client, process.env.OWNER_USER_ID);
    await owner.send({embeds: [embed]}).catch(console.error);
    await interaction.editReply({embeds: [embed]}).catch(console.error);
    await updateCringePoints([{userId: user.id, points: -price}, {userId: process.env.CLIENT_ID, points: price}]);
}

const name = 'audio';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription(`Request a feature. Min price: ${audio.min.toLocaleString()} points. Prices scale with house debt.`)
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

export default { execute, name, subcommandBuilder };