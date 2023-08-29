import { ChannelManager, ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder, bold } from 'discord.js';
import { getUserCringePoints, updateCringePoints } from '../../../sql/tables/cringe-points';
import { ProfitType, updateProfits } from '../../../sql/tables/profits';
import { emptyEmbedFieldInline } from '../../../util/discordUtil';
import { joinVoicePlayAudio } from '../../../voice';
import audio from '../../../util/audioFileMap';
import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';

type GambleEvents = {
    end: (userId: string, wager: number, profit: number, channels: ChannelManager, channelId: string) => Promise<void>
  }
const gambleEmitter = new EventEmitter() as TypedEmitter<GambleEvents>;

const chances = [50, 30, 10, 1];
const payouts: {[key: number]: {num: number, str: string}} = {};
for (let i = 0; i < chances.length; i++) {
    const num = 100 / chances[i];
    const str = `${Math.round(num * 100) / 100}x`;
    payouts[chances[i]] = {num, str};
}

function gamble(bet: number, chance: number) {
    const result = Math.random();
    if (result < (chance/100)) {
        return Math.ceil(bet * payouts[chance].num) - bet;
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
        await updateProfits([{userId: user.id, type: ProfitType.Gamble, winnings: profit, losses: 0}]);
    }
    else {
        title += 'LOST';
        const newBalance = balance + profit;
        balanceFieldValue = `${balance.toLocaleString()} (${profit.toLocaleString()})`;
        newBalanceFieldValue = `${newBalance.toLocaleString()}`;
        if (newBalance <= 0) {
            joinVoicePlayAudio(interaction, audio.clownMusic);
        }
        await updateProfits([{userId: user.id, type: ProfitType.Gamble, winnings: 0, losses: pointsBet}]);
    }
    // Update user Cringe points
    await updateCringePoints([{userId: user.id, points: profit}]);
    // Update house Cringe points
    if (process.env.CLIENT_ID) await updateCringePoints([{userId: process.env.CLIENT_ID, points: -profit}]);
    gambleEmitter.emit('end', user.id, pointsBet, profit, interaction.client.channels, interaction.channelId);

    const embed = new EmbedBuilder()
        .setTitle(title)
        .addFields(
            {name: 'Points Bet', value: `${pointsBet.toLocaleString()}`, inline: true},
            {name: 'Chance', value: `${chance}%`, inline: true},
            {name: 'Payout', value: `${payouts[chance].str}`, inline: true},
            {name: 'Balance ', value: balanceFieldValue, inline: true},
            {name: 'New Balance ', value: newBalanceFieldValue, inline: true},
            emptyEmbedFieldInline
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
        .setDescription(`The chance of winning. ${Object.entries(payouts).reverse().map(([chance, payout]) => `${chance}% = ${payout.str}`).join(', ')}`)
        .addChoices(
            ...Object.keys(payouts).reverse().map(chance => { return {name: `${chance}%`, value: parseInt(chance)}; })
        )
    );

export default { execute, name, subcommandBuilder };
export { gamble, payouts, gambleEmitter };