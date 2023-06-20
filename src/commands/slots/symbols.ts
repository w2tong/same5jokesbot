import { GuildEmoji } from 'discord.js';
import { Emotes } from '../../emotes';

const slotsSymbols: {[key: string]: SlotsSymbol} = {
    OMEGALAUGHING:  {pc: 0.05, mult: 2, emote: Emotes.OMEGALAUGHING, backupEmote: ''},
    NOOO:           {pc: 0.1, mult: 2, emote: Emotes.NOOO, backupEmote: ''},
    DESKCHAN:       {pc: 0.2, mult: 2, emote: Emotes.DESKCHAN, backupEmote: ''},
    Clueless:       {pc: 0.25, mult: 2.5, emote: Emotes.Clueless, backupEmote: ''},
    pawgchamp:      {pc: 0.3, mult: 3, emote: Emotes.pawgchamp, backupEmote: ''},
    gachiBASS:      {pc: 0.35, mult: 3.5, emote: Emotes.gachiBASS, backupEmote: ''},
    THIS:           {pc: 0.4, mult: 4, emote: Emotes.THIS, backupEmote: ''},
    peepoYell:      {pc: 0.45, mult: 4.5, emote: Emotes.peepoYell, backupEmote: ''},
    OkaygeBusiness: {pc: 0.5, mult: 5, emote: Emotes.OkaygeBusiness, backupEmote: ''},
    vacation:       {pc: 0.6, mult: 6, emote: Emotes.vacation, backupEmote: ''},
    borpaSpin:      {pc: 0.8, mult: 10, emote: Emotes.borpaSpin, backupEmote: ''},
    ChugU:          {pc: 1, mult: 15, emote: Emotes.ChugU, backupEmote: ''}
};

function repeatSymbolArray (symbol: SlotsSymbol, repeat: number) {
    return Array<SlotsSymbol>(repeat).fill(symbol);
}

type SlotsSymbol = {pc: number, mult: number, emote: string, backupEmote: string};
const symbols = [
    ...repeatSymbolArray(slotsSymbols.OMEGALAUGHING, 10),
    ...repeatSymbolArray(slotsSymbols.NOOO, 9),
    ...repeatSymbolArray(slotsSymbols.DESKCHAN, 8),
    ...repeatSymbolArray(slotsSymbols.Clueless, 7),
    ...repeatSymbolArray(slotsSymbols.pawgchamp, 6),
    ...repeatSymbolArray(slotsSymbols.gachiBASS, 5),
    ...repeatSymbolArray(slotsSymbols.THIS, 5),
    ...repeatSymbolArray(slotsSymbols.peepoYell, 5),
    ...repeatSymbolArray(slotsSymbols.OkaygeBusiness, 4),
    ...repeatSymbolArray(slotsSymbols.vacation, 3),
    ...repeatSymbolArray(slotsSymbols.borpaSpin, 2),
    ...repeatSymbolArray(slotsSymbols.ChugU, 1),
];

type SpecialSymbol = {mult: number, freeSpins: number, emote: GuildEmoji|string, backupEmote: string}
const specialSymbols: {[key: number]: Array<SpecialSymbol>} = {
    0.1: [
        {mult: 1000, freeSpins: 0, emote: '', backupEmote: '📖'},
    ],
    1: [
        {mult: 100, freeSpins: 0, emote: '', backupEmote: '🧧'},
        {mult: 10, freeSpins: 10, emote: '', backupEmote: '🔟'}
    ],
    10: [
        {mult: 10, freeSpins: 3, emote: '', backupEmote: '3️⃣'}
    ],
    25: [
        {mult: 10, freeSpins: 1, emote: '', backupEmote: '1️⃣'}
    ],
    50 : [
        {mult: 10, freeSpins: 0, emote: '', backupEmote: '💰'},
    ],
    100: [
        {mult: 5, freeSpins: 0, emote: '', backupEmote: '💵'},
    ],
};

export {slotsSymbols, symbols, specialSymbols};