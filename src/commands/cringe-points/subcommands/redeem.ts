import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder, bold } from 'discord.js';
import { getUserCringePoints, updateCringePoints } from '../../../sql/tables/cringe_points';
import { getDailyCoins, updateDailyCoins } from '../../../sql/tables/daily_coins';
import { emptyEmbedFieldInline } from '../../../util/discordUtil';

async function execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.user;
    const amount = interaction.options.getInteger('amount') ?? 1;
    
    const userCringePoints = await getUserCringePoints(user.id) ?? 0;
    const userCoinsTotal = await getDailyCoins(user.id) ?? 0;
    const cringePointsCost = 1000000 * amount;
    if (userCringePoints < cringePointsCost) {
        await interaction.reply({content: `You do not have enough points (Balance: ${bold(userCringePoints.toLocaleString())}).`, ephemeral: true});
        return;
    }

    await interaction.deferReply();
    await updateCringePoints([
        {userId: user.id, points: -cringePointsCost},
    ]);
    await updateDailyCoins(user.id, amount
    );
    
    const embed = new EmbedBuilder()
        .setTitle(`${user.username} bought ${amount} coin(s)`)
        .addFields(
            {name: 'Points', value: `${userCringePoints.toLocaleString()} (-${cringePointsCost.toLocaleString()})`, inline: true},
            {name: 'Coins', value: `${userCoinsTotal.toLocaleString()} (+${amount.toLocaleString()})`, inline: true},
            emptyEmbedFieldInline
        );
    void interaction.editReply({embeds: [embed]});
}

const name = 'redeem';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Redeem a coin with 1000000 points.')
    .addIntegerOption(option => option
        .setName('amount')
        .setDescription('Enter the amount of coins you want to redeem.')
        .setMinValue(1)
    );

export default { execute, name, subcommandBuilder };