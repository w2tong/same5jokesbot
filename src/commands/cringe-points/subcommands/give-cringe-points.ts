import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { getUserCringePoints, updateCringePoints } from '../../../sql/cringe-points';
import { emptyEmbedField } from '../../../discordUtil';

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

    if (recipient.bot) {
        await interaction.reply({content: 'You cannot give Cringe points to a bot.', ephemeral: true});
        return;
    }
        
    const giverCringePoints = await getUserCringePoints(giver.id) ?? 0;
    if (amount > giverCringePoints) {
        await interaction.reply({content: `You do not have enough points (Balance: **${giverCringePoints}**).`, ephemeral: true});
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
            {name: 'Balance', value: `${giverCringePoints} (-${amount})`, inline: true},
            {name: 'Balance', value: `${recipientCringePoints} (+${amount})`, inline: true},
            emptyEmbedField,
            {name: 'New Balance', value: `${giverCringePoints - amount}`, inline: true},
            {name: 'New Balance', value: `${recipientCringePoints + amount}`, inline: true},
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