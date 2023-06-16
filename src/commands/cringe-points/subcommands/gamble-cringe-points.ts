import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { getUserCringePoints, updateCringePoints } from '../../../sql/cringe-points';
import { emptyEmbedField } from '../../../discordUtil';

const payouts: {[key: string]: number} = {
    '50': 2,
    '30': 5,
    '10': 20,
    '1': 500
};

async function execute(interaction: ChatInputCommandInteraction) {
    
    const user = interaction.user;
    let amount = interaction.options.getInteger('amount');
    const chance = (interaction.options.getString('chance') ?? '50');
    if (!amount) {
        await interaction.reply({content: 'Error getting input.', ephemeral: true});
        return;
    }
        
    const cringePoints = await getUserCringePoints(user.id) ?? 0;
    if (amount > cringePoints) {
        await interaction.reply({content: `You do not have enough points (Balance **${cringePoints}**).`, ephemeral: true});
        return;
    }

    await interaction.deferReply();
    const result = Math.random();

    let title = `${user.username} `;
    const betField = { name: 'Points Bet', value: `${amount}`, inline: true };
    const balanceField = {name: 'Balance ', value: '', inline: true};
    const newBalanceField = {name: 'New Balance ', value: '', inline: true};

    if (result < parseInt(chance)/100) {
        const winnings = amount * payouts[chance] - amount;
        title += 'WON';
        balanceField.value = `${cringePoints} (+${winnings})`;
        newBalanceField.value = `${cringePoints + winnings}`;
        amount = winnings;
    }
    else {
        title += 'LOST';
        amount = -amount;
        balanceField.value = `${cringePoints} (${amount})`;
        newBalanceField.value = `${cringePoints + amount}`;
    }
    void updateCringePoints([{userId: user.id, points: amount}]);

    const embed = new EmbedBuilder()
        .setTitle(title)
        .addFields(
            betField,
            {name: 'Chance', value: `${chance}%`, inline: true},
            {name: 'Payout', value: `${payouts[chance]}x`, inline: true},
            balanceField,
            newBalanceField,
            emptyEmbedField
        );
    void interaction.editReply({embeds: [embed]});
}

const name = 'gamble';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Gamble your cringe points. 50% = x2, 30% = x5, 10% = x20, 1% = x500')
    .addIntegerOption(option => option
        .setName('amount')
        .setDescription('The amount of points you are betting.')
        .setRequired(true)
        .setMinValue(1)
    )
    .addStringOption(option => option
        .setName('chance')
        .setDescription('Default: 50% = x2, 30% = x5, 10% = x20, 1% = x500')
        .addChoices(
            {name: '30%', value: '30'},
            {name: '10%', value: '10'},
            {name: '1%', value: '1'}
        )
    );

export default { execute, name, subcommandBuilder };