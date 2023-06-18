import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { getUserCringePoints, updateCringePoints } from '../../../sql/tables/cringe-points';
import { updateGambleProfits } from '../../../sql/tables/gamble-profits';
import { emptyEmbedField } from '../../../discordUtil';
import { joinVoicePlayAudio } from '../../../voice';
import audio from '../../../audioFileMap';

const payouts: {[key: number]: number} = {
    50: 2,
    30: 3.4,
    10: 10.5,
    1: 110
};

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const user = interaction.user;
    const pointsBet = interaction.options.getInteger('points');
    const chance = (interaction.options.getInteger('chance') ?? 50);
    if (!pointsBet) {
        await interaction.editReply('Error getting input.');
        return;
    }
        
    const cringePoints = await getUserCringePoints(user.id) ?? 0;
    if (pointsBet > cringePoints) {
        await interaction.editReply(`You do not have enough points (Balance **${cringePoints.toLocaleString()}**).`);
        return;
    }
    
    const result = Math.random();

    let title = `${user.username} `;
    let balanceFieldValue = '';
    let newBalanceFieldValue = '';

    if (result < chance/100) {
        const winnings = Math.ceil(pointsBet * payouts[chance]) - pointsBet;
        title += 'WON';
        balanceFieldValue = `${cringePoints.toLocaleString()} (+${winnings.toLocaleString()})`;
        newBalanceFieldValue = `${(cringePoints + winnings).toLocaleString()}`;
        if (winnings >= 1000 && ((pointsBet / cringePoints) >= 0.1 || chance === 10 || chance === 1)) {
            joinVoicePlayAudio(interaction, audio.winnerGagnant);
        }
        void updateCringePoints([{userId: user.id, points: winnings}]);
        void updateGambleProfits(user.id, winnings, 0);
    }
    else {
        title += 'LOST';
        const newBalance = cringePoints - pointsBet;
        balanceFieldValue = `${cringePoints.toLocaleString()} (-${pointsBet.toLocaleString()})`;
        newBalanceFieldValue = `${newBalance.toLocaleString()}`;
        if (newBalance <= 0) {
            joinVoicePlayAudio(interaction, audio.clownMusic);
        }
        void updateCringePoints([{userId: user.id, points: -pointsBet}]);
        void updateGambleProfits(user.id, 0, pointsBet);
    }

    const embed = new EmbedBuilder()
        .setTitle(title)
        .addFields(
            { name: 'Points Bet', value: `${pointsBet.toLocaleString()}`, inline: true },
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