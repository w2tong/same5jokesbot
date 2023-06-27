import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { Emotes, emotes } from '../../../emotes';
import { getRandomRange } from '../../../util/util';
import { getUserCringePoints, updateCringePoints } from '../../../sql/tables/cringe-points';
import { updateSlotsProfits } from '../../../sql/tables/slots-profits';
import { symbols, specialSymbols } from '../symbols';

const reels = 5;
const specialChance = 0.05;
const enum ComboMultiplier {
    Five = 10,
    FullHouse = 5
}

function spin(amount: number) {
    // Normal symbols
    let prevSymbolEmote = '';
    let winnings = 0;
    let currWinnings = 0;

    // Special symbols
    let freeSpins = 0;
    let specialMultiplier = 1;
    let hasSpecial = false;

    // Combo multiplier
    let comboMultiplier = 1;

    let spinString = '';
    const streak = [];
    let currStreak = 0;
    for (let i = 0; i < reels; i++) {
        let symbolEmote = '';
        const specialChanceRoll = Math.random();
        if (!hasSpecial && specialChanceRoll < specialChance) {
            currStreak++;
            hasSpecial = true;
            const specialRoll = Math.random();
            for (const key of Object.keys(specialSymbols)) {
                const specialSymbolKey = parseInt(key);
                if (specialRoll < specialSymbolKey/100) {
                    const specialSymbol = specialSymbols[specialSymbolKey][getRandomRange(specialSymbols[specialSymbolKey].length)];
                    freeSpins += specialSymbol.freeSpins;
                    specialMultiplier = specialSymbol.mult;
                    symbolEmote = specialSymbol.backupEmote;
                    break;
                }
            }
        }
        else {
            const symbolIndex = getRandomRange(symbols.length);
            const symbol = symbols[symbolIndex];
            if (symbol.emote === prevSymbolEmote) {
                if (currWinnings === 0) currWinnings = amount * symbol.pc;
                currWinnings *= symbol.mult;
                currStreak++;
            }
            else {
                winnings += currWinnings;
                currWinnings = 0;
                if (i !== 0) streak.push(currStreak);
                currStreak = 1;
            }
            symbolEmote = emotes[symbol.emote] ? emotes[symbol.emote].toString() : symbol.backupEmote;
            prevSymbolEmote = symbol.emote;
        }
        
        spinString += `${symbolEmote}`;
    }
    streak.push(currStreak);
    if (streak.length === 1) {
        comboMultiplier = ComboMultiplier.Five;
    }
    else if (streak.length === 2) {
        if (streak.sort().toString() === [2,3].toString()) {
            comboMultiplier = ComboMultiplier.FullHouse;
        }
    }
    return {winnings: Math.ceil((winnings + currWinnings) * specialMultiplier * comboMultiplier), freeSpins, spinString};
}

async function execute(interaction: ChatInputCommandInteraction) {
    try {
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
        let freeSpins = 0;
        
        for (let i = 0; i < numOfSpins + freeSpins; i++) {
            const result = spin(pointsBet);
            winnings += result.winnings;
            freeSpins += result.freeSpins;
            if (result.winnings > maxWinnings) {
                maxWinnings = result.winnings;
                bestSpin = result.spinString;
            }
        }
    
        const totalPointsBet = pointsBet * numOfSpins;
        const profit = winnings - totalPointsBet;
        const balanceFieldValue = `${balance.toLocaleString()} (${profit>0 ? '+' : ''}${profit.toLocaleString()})`;
        const newBalanceFieldValue = (balance + profit).toLocaleString();
    
        void updateCringePoints([{userId: user.id, points: profit}]);
        if (profit > 0) void updateSlotsProfits(user.id, profit, 0);
        else if (profit < 0) void updateSlotsProfits(user.id, 0, -profit);
        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s ${emotes[Emotes.borpaSpin] ?? 'spin'}${numOfSpins > 1 ? 's' : ''}`)
            .addFields(
                {name: 'Points Bet', value: `${pointsBet.toLocaleString()} ${(numOfSpins + freeSpins) > 1 ? `(x${numOfSpins}${freeSpins > 0 ? ` + ${freeSpins}` : ''})` : ''}`, inline: true},
                {name: 'Winnings', value: `${winnings.toLocaleString()}`, inline: true},
                {name: `Best ${emotes[Emotes.borpaSpin] ?? 'Spin'}`, value: `${bestSpin}`, inline: true},
                {name: 'Balance ', value: balanceFieldValue, inline: true},
                {name: 'New Balance ', value: newBalanceFieldValue, inline: true},
            );
        void interaction.editReply({embeds: [embed]});
    }
    catch(err) {
        console.log(err);
    }
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
            {name: '100', value: 100}
        )
    );

export default { execute, name, subcommandBuilder };
export { spin };