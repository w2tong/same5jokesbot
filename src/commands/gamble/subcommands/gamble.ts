import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder, bold } from 'discord.js';
import { getUserCringePoints, updateCringePoints } from '../../../sql/tables/cringe-points';
import { updateGambleProfits } from '../../../sql/tables/gamble-profits';
import { emptyEmbedField } from '../../../util/discordUtil';
import { joinVoicePlayAudio } from '../../../voice';
import audio from '../../../util/audioFileMap';

const payouts: {[key: number]: number} = {
    50: 2,
    30: 3.33,
    10: 10,
    1: 100
};

function gamble(bet: number, chance: number) {
    const result = Math.random();
    if (result < (chance/100)) {
        return Math.ceil(bet * payouts[chance]) - bet;
    }
    else {
        return -bet;
    }
}

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const user = interaction.user;
    const pointsBet = interaction.options.getInteger('points');
    const chance = (interaction.options.getInteger('chance') ?? 50);
    if (!pointsBet) {
        await interaction.editReply('Error getting input.');
        return;
    }
        
    const balance = await getUserCringePoints(user.id) ?? 0;
    if (pointsBet > balance) {
        await interaction.editReply(`You do not have enough points (Balance ${bold(balance.toLocaleString())}).`);
        return;
    }

    let title = `${user.username} `;
    let balanceFieldValue = '';
    let newBalanceFieldValue = '';

    const profit = gamble(pointsBet, chance);
    if (profit > 0) {
        title += 'WON';
        balanceFieldValue = `${balance.toLocaleString()} (+${profit.toLocaleString()})`;
        newBalanceFieldValue = `${(balance + profit).toLocaleString()}`;
        if (profit >= 1000 && ((pointsBet / balance) >= 0.1 || chance === 10 || chance === 1)) {
            joinVoicePlayAudio(interaction, audio.winnerGagnant);
        }
        void updateGambleProfits(user.id, profit, 0);
    }
    else {
        title += 'LOST';
        const newBalance = balance + profit;
        balanceFieldValue = `${balance.toLocaleString()} (${profit.toLocaleString()})`;
        newBalanceFieldValue = `${newBalance.toLocaleString()}`;
        if (newBalance <= 0) {
            joinVoicePlayAudio(interaction, audio.clownMusic);
        }
        void updateGambleProfits(user.id, 0, pointsBet);
    }
    // Update user Cringe points
    void updateCringePoints([{userId: user.id, points: profit}]);
    // Update house Cringe points
    if (process.env.CLIENT_ID) void updateCringePoints([{userId: process.env.CLIENT_ID, points: -profit}]);

    const embed = new EmbedBuilder()
        .setTitle(title)
        .addFields(
            {name: 'Points Bet', value: `${pointsBet.toLocaleString()}`, inline: true},
            {name: 'Chance', value: `${chance}%`, inline: true},
            {name: 'Payout', value: `${payouts[chance]}x`, inline: true},
            {name: 'Balance ', value: balanceFieldValue, inline: true},
            {name: 'New Balance ', value: newBalanceFieldValue, inline: true},
            emptyEmbedField
        );
    void interaction.editReply({embeds: [embed]});
}

const name = 'gamble';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Gamble your cringe points. Default bet is 50% chance with 2x payout.')
    .addIntegerOption(option => option
        .setName('points')
        .setDescription('The number of points you are betting.')
        .setRequired(true)
        .setMinValue(1)
    )
    .addIntegerOption(option => option
        .setName('chance')
        .setDescription(`The chance of winning. ${Object.entries(payouts).reverse().map(([chance, payout]) => `${chance}% = ${payout}x`).join(', ')}`)
        .addChoices(
            {name: '50%', value: 50},
            {name: '30%', value: 30},
            {name: '10%', value: 10},
            {name: '1%', value: 1}
        )
    );

export default { execute, name, subcommandBuilder };
export { gamble, payouts };