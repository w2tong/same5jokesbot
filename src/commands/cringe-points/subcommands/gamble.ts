import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { getUserCringePoints, updateCringePoints } from '../../../sql/cringe-points';
import { updateGambleProfits } from '../../../sql/gamble-profits';
import { emptyEmbedField } from '../../../discordUtil';
import { joinVoicePlayAudio } from '../../../voice';
import audio from '../../../audioFileMap';

const payouts: {[key: number]: number} = {
    50: 2,
    30: 3.5,
    10: 12,
    1: 150
};

async function execute(interaction: ChatInputCommandInteraction) {
    
    const user = interaction.user;
    let pointsBet = interaction.options.getInteger('points');
    const chance = (interaction.options.getInteger('chance') ?? 50);
    if (!pointsBet) {
        await interaction.reply({content: 'Error getting input.', ephemeral: true});
        return;
    }
        
    const cringePoints = await getUserCringePoints(user.id) ?? 0;
    if (pointsBet > cringePoints) {
        await interaction.reply({content: `You do not have enough points (Balance **${cringePoints}**).`, ephemeral: true});
        return;
    }

    await interaction.deferReply();
    const result = Math.random();

    let title = `${user.username} `;
    const betField = { name: 'Points Bet', value: `${pointsBet}`, inline: true };
    const balanceField = {name: 'Balance ', value: '', inline: true};
    const newBalanceField = {name: 'New Balance ', value: '', inline: true};

    if (result < chance/100) {
        const winnings = pointsBet * payouts[chance] - pointsBet;
        title += 'WON';
        balanceField.value = `${cringePoints} (+${winnings})`;
        newBalanceField.value = `${cringePoints + winnings}`;
        pointsBet = winnings;
        if (winnings >= 1000 && ((pointsBet / cringePoints) >= 0.1 || chance === 10 || chance === 1)) {
            joinVoicePlayAudio(interaction, audio.winnerGagnant);
        }
        void updateGambleProfits(user.id, winnings, 0);
    }
    else {
        title += 'LOST';
        const newBalance = cringePoints - pointsBet;
        balanceField.value = `${cringePoints} (-${pointsBet})`;
        newBalanceField.value = `${newBalance}`;
        if (newBalance <= 0) {
            joinVoicePlayAudio(interaction, audio.clownMusic);
        }
        void updateGambleProfits(user.id, 0, pointsBet);
        pointsBet = -pointsBet;
    }
    void updateCringePoints([{userId: user.id, points: pointsBet}]);

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
    .setDescription('Gamble your cringe points. Default bet is 50% chance with 2x payout.')
    .addIntegerOption(option => option
        .setName('points')
        .setDescription('The number of points you are betting.')
        .setRequired(true)
        .setMinValue(1)
    )
    .addIntegerOption(option => option
        .setName('chance')
        .setDescription('The chance of winning.')
        .addChoices(
            {name: `30%, ${payouts[30]}x payout`, value: 30},
            {name: `10%, ${payouts[10]}x payout`, value: 10},
            {name: `1%, ${payouts[1]}x payout`, value: 1}
        )
    );

export default { execute, name, subcommandBuilder };