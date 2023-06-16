import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { getUserCringePoints, updateCringePoints } from '../../../sql/cringe-points';

async function execute(interaction: ChatInputCommandInteraction) {
    
    const user = interaction.user;
    let amount = interaction.options.getInteger('amount');
    const chance = interaction.options.getInteger('chance') ?? 0.5;
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

    if (result < chance) {
        const winnings = Math.ceil(amount/chance) - amount;
        title += 'WON';
        balanceField.value = `${cringePoints} (+${winnings})`;
        newBalanceField.value = `${cringePoints + winnings}`;
        amount = winnings;
    }
    else {
        title += 'LOST';
        amount = -amount;
        balanceField.value = `${cringePoints} (${amount})`;
        newBalanceField.value = `${cringePoints - amount}`;
    }
    void updateCringePoints([{userId: user.id, points: amount}]);

    const embed = new EmbedBuilder()
        .setTitle(title)
        .addFields(
            betField,
            {name: 'Chance', value: `${parseFloat((chance*100).toFixed(2))}%`, inline: true},
            balanceField,
            newBalanceField
        );
    void interaction.editReply({embeds: [embed]});
}

const name = 'gamble';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Gamble your cringe points. 50% = x2, 30% = x3.33, 10% = x10')
    
    .addIntegerOption(option => option
        .setName('amount')
        .setDescription('The amount of points you are betting.')
        .setRequired(true)
        .setMinValue(1)
    )
    .addIntegerOption(option => option
        .setName('chance')
        .setDescription('Default: 50% = x2, 30% = x3.33, 10% = x10')
        .addChoices(
            {name: '30%', value: 0.3},
            {name: '10%', value: 0.1}
        )
    );

export default { execute, name, subcommandBuilder };