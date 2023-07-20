import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder, bold } from 'discord.js';
import { getUserCringePoints, updateCringePoints } from '../../../sql/tables/cringe-points';
import { emptyEmbedField } from '../../../util/discordUtil';

async function execute(interaction: ChatInputCommandInteraction) {
    const giver = interaction.user;
    const recipient = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    if (!recipient || !amount) {
        await interaction.reply({content: 'Error getting input.', ephemeral: true});
        return;
    }

    if (giver.id === recipient.id) {
        await interaction.reply({content: 'You cannot give Cringe points to yourself.', ephemeral: true});
        return;
    }

    if (recipient.bot && recipient.id !== process.env.CLIENT_ID) {
        await interaction.reply({content: 'You cannot give Cringe points to a bot (except this bot).', ephemeral: true});
        return;
    }
        
    const giverCringePoints = await getUserCringePoints(giver.id) ?? 0;
    if (amount > giverCringePoints) {
        await interaction.reply({content: `You do not have enough points (Balance: ${bold(giverCringePoints.toLocaleString())}).`, ephemeral: true});
        return;
    }

    await interaction.deferReply();
    const recipientCringePoints = await getUserCringePoints(recipient.id) ?? 0;
    void updateCringePoints([{userId: giver.id, points: -amount}]);
    void updateCringePoints([{userId: recipient.id, points: amount}]);
    
    const embed = new EmbedBuilder()
        .setTitle(`${giver.username} gifted points to ${recipient.username}`)
        .addFields(
            {name: 'Giver', value: `${giver}`, inline: true},
            {name: 'Recipient', value: `${recipient}`, inline: true},
            emptyEmbedField,
            {name: 'Balance', value: `${giverCringePoints.toLocaleString()} (-${amount.toLocaleString()})`, inline: true},
            {name: 'Balance', value: `${recipientCringePoints.toLocaleString()} (+${amount.toLocaleString()})`, inline: true},
            emptyEmbedField,
            {name: 'New Balance', value: `${(giverCringePoints - amount).toLocaleString()}`, inline: true},
            {name: 'New Balance', value: `${(recipientCringePoints + amount).toLocaleString()}`, inline: true},
            emptyEmbedField
        );
    void interaction.editReply({embeds: [embed]});
}

const name = 'give';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Give your Cringe points to another user')
    .addUserOption(option => option
        .setName('user')
        .setDescription('The user you are giving points to')
        .setRequired(true)
    )
    .addIntegerOption(option => option
        .setName('amount')
        .setDescription('The amount of points you are giving.')
        .setRequired(true)
        .setMinValue(1)
    );

export default { execute, name, subcommandBuilder };