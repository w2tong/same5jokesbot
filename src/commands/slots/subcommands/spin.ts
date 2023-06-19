import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { emotes } from '../../../emotes';
import { getRandomRange } from '../../../util';
import { getUserCringePoints, updateCringePoints } from '../../../sql/tables/cringe-points';
import { updateSlotsProfits } from '../../../sql/tables/slots-profits';
import symbols from '../symbols';

function spin(amount: number) {
    const reels = 5;
    let prevSymbolIndex = -1;
    let winnings = 0;
    let currWinnings = 0;
    let spinString = '';
    for (let i = 0; i < reels; i++) {
        const symbolIndex = getRandomRange(symbols.length);
        const symbol = symbols[symbolIndex];
        if (symbolIndex === prevSymbolIndex) {
            if (currWinnings === 0) currWinnings = amount * symbol.pc;
            currWinnings *= symbol.mult;
        }
        else {
            winnings += currWinnings;
            currWinnings = 0;
        }
        spinString += `${emotes[symbol.emote]}`;
        prevSymbolIndex = symbolIndex;
    }
    return {winnings: Math.ceil(winnings + currWinnings), spinString};
}

// function spinSim(numofSpins: number, bet: number) {
//     let profits = 0;
//     for (let i = 0; i < numofSpins; i++) {
//         profits += spin(bet).winnings - bet;
//     }
//     return profits;
// }
// console.log('100 spins', spinSim(100, 100));
// console.log('1,000 spins', spinSim(1000, 100));
// console.log('10,000 spins', spinSim(10000, 100));
// console.log('100,000 spins', spinSim(100000, 100));
// console.log('1,000,000 spins', spinSim(1000000, 100));
// console.log('10,000,000 spins', spinSim(10000000, 100));

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const user = interaction.user;
    const pointsBet = interaction.options.getInteger('amount');
    const numOfSpins = interaction.options.getInteger('spins') ?? 1;
    if (!pointsBet) {
        void interaction.editReply('Error spinning slot machine.');
        return;
    }
    const balance = await getUserCringePoints(user.id) ?? 0;
    if (pointsBet * numOfSpins > balance) {
        await interaction.editReply({content: `You do not have enough points (Balance **${balance.toLocaleString()}**).`, files: ['https://i.kym-cdn.com/photos/images/original/002/508/125/847.jpg'] });
        return;
    }
    let bestSpin = '';
    let maxWinnings = -Infinity;
    let winnings = 0;
        
    for (let i = 0; i < numOfSpins; i++) {
        const result = spin(pointsBet);
        winnings += result.winnings;
        if (result.winnings > maxWinnings) {
            maxWinnings = result.winnings;
            bestSpin = result.spinString;
        }
    }
    
    const totalPointsBet = pointsBet * numOfSpins;
    const profit = winnings - totalPointsBet;
    const balanceFieldValue = `${balance} (${profit>0 ? '+' : ''}${profit})`;
    const newBalanceFieldValue = (balance + profit).toLocaleString();
    
    void updateCringePoints([{userId: user.id, points: profit}]);
    if (profit > 0) void updateSlotsProfits(user.id, profit, 0);
    else if (profit < 0) void updateSlotsProfits(user.id, 0, -profit);
    
    const embed = new EmbedBuilder()
        .setTitle(`${user.username}'s spin${numOfSpins > 1 ? 's' : ''}`)
        .addFields(
            {name: 'Points Bet', value: `${pointsBet} ${numOfSpins > 1 ? `x ${numOfSpins}` : ''}`, inline: true},
            {name: 'Winnings', value: `${winnings}`, inline: true},
            {name: `${numOfSpins > 1 ? 'Best ' : ''}Spin`, value: `${bestSpin}`, inline: true},
            {name: 'Balance ', value: balanceFieldValue, inline: true},
            {name: 'New Balance ', value: newBalanceFieldValue, inline: true},
        );
    void interaction.editReply({embeds: [embed]});
}

const name = 'spin';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('slots spin wheel.')
    .addIntegerOption((option) => option
        .setName('amount')
        .setDescription('Amount to spin.')
        .setRequired(true)
    )
    .addIntegerOption((option) => option
        .setName('spins')
        .setDescription('Number of spins.')
        .addChoices(
            {name: '1', value: 1},
            {name: '10', value: 10},
            {name: '100', value: 100},
            {name: '1000', value: 1000}
        )
    );

export default { execute, name, subcommandBuilder };