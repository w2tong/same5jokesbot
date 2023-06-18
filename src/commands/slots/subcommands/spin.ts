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

function spinSim(numofSpins: number, bet: number) {
    let profits = 0;
    for (let i = 0; i < numofSpins; i++) {
        profits += spin(bet).winnings - bet;
    }
    return profits;
}

console.log('100 spins', spinSim(100, 100));
console.log('1,000 spins', spinSim(1000, 100));
console.log('10,000 spins', spinSim(10000, 100));
console.log('100,000 spins', spinSim(100000, 100));
console.log('1,000,000 spins', spinSim(1000000, 100));
console.log('10,000,000 spins', spinSim(10000000, 100));

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const user = interaction.user;
    const pointsBet = interaction.options.getInteger('amount');
    if (!pointsBet) {
        void interaction.editReply('Error spinning slot machine.');
        return;
    }
    const balance = await getUserCringePoints(user.id) ?? 0;
    if (pointsBet > balance) {
        await interaction.editReply(`You do not have enough points (Balance **${balance.toLocaleString()}**).`);
        return;
    }
    const result = spin(pointsBet);
    const profit = result.winnings - pointsBet;
    const balanceFieldValue = `${balance} (${profit>0 ? '+' : ''}${profit})`;
    const newBalanceFieldValue = (balance + profit).toLocaleString();
    
    void updateCringePoints([{userId: user.id, points: profit}]);
    if (profit > 0) void updateSlotsProfits(user.id, result.winnings - pointsBet, 0);
    else if (profit < 0) void updateSlotsProfits(user.id, 0, pointsBet - result.winnings);
    
    const embed = new EmbedBuilder()
        .setTitle(`${user.username}'s spin`)
        .addFields(
            {name: 'Points Bet', value: `${pointsBet}`, inline: true},
            {name: 'Winnings', value: `${result.winnings}`, inline: true},
            {name: 'Spin Result', value: `${result.spinString}`, inline: true},
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
    );

export default { execute, name, subcommandBuilder };