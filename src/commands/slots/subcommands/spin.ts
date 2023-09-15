import { ChatInputCommandInteraction, Client, EmbedBuilder, SlashCommandSubcommandBuilder, User, bold } from 'discord.js';
import { Emotes, emotes } from '../../../util/emotes';
import { getRandomRange } from '../../../util/util';
import { getUserCringePoints, houseUserTransfer } from '../../../sql/tables/cringe_points';
import { ProfitType, updateProfits } from '../../../sql/tables/profits';
import { symbols, specialSymbols } from '../symbols';
import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';

type SlotsEvents = {
    end: (user: User, wager: number, profit: number, client: Client, channelId: string) => Promise<void>
  }
const slotsEmitter = new EventEmitter() as TypedEmitter<SlotsEvents>;

const reels = 5;
const specialChance = 0.05;
const enum ComboMultiplier {
    Five = 10,
    FullHouse = 5
}
const maxWager = 10_000;
const maxSpins = 100;

function spin(wager: number) {
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
                if (currWinnings === 0) currWinnings = wager * symbol.pc;
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
        const wager = interaction.options.getInteger('wager');
        const numOfSpins = interaction.options.getInteger('spins') ?? 1;
        if (!wager) {
            void interaction.editReply('Error spinning slot machine.');
            return;
        }
        const totalWager = wager * numOfSpins;
        const balance = await getUserCringePoints(user.id) ?? 0;
        if (wager * numOfSpins > balance) {
            await interaction.editReply({content: `You do not have enough points (Balance ${bold(balance.toLocaleString())}).`, files: ['https://i.kym-cdn.com/photos/images/original/002/508/125/847.jpg'] });
            return;
        }
        let bestSpin = '';
        let maxWinnings = -Infinity;
        let winnings = 0;
        let freeSpins = 0;
        
        for (let i = 0; i < numOfSpins + freeSpins; i++) {
            const result = spin(wager);
            winnings += result.winnings;
            freeSpins += result.freeSpins;
            if (result.winnings > maxWinnings) {
                maxWinnings = result.winnings;
                bestSpin = result.spinString;
            }
        }
        
        const profit = winnings - totalWager;
        slotsEmitter.emit('end', user, totalWager, profit, interaction.client, interaction.channelId);

        const balanceFieldValue = `${balance.toLocaleString()} (${profit>0 ? '+' : ''}${profit.toLocaleString()})`;
        const newBalanceFieldValue = (balance + profit).toLocaleString();
    
        if (profit !== 0) {
            await houseUserTransfer([{userId: user.id, points: profit}]);
            await updateProfits([{userId: user.id, type: ProfitType.Slots, profit}]);
        }
        
        const embed = new EmbedBuilder()
            .setAuthor({name: `${user.username}'s spin${numOfSpins > 1 ? 's' : ''}`, iconURL: user.displayAvatarURL()})
            .addFields(
                {name: 'Points Bet', value: `${wager.toLocaleString()} ${(numOfSpins + freeSpins) > 1 ? `(x${numOfSpins}${freeSpins > 0 ? ` + ${freeSpins}` : ''})` : ''}`, inline: true},
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
        .setName('wager')
        .setDescription('Enter your wager')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(maxWager)
    )
    .addIntegerOption((option) => option
        .setName('spins')
        .setDescription('Enter the number of spins.')
        .setMaxValue(1)
        .setMaxValue(maxSpins)
    );

export default { execute, name, subcommandBuilder };
export { spin, slotsEmitter };