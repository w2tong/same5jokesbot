import { CharacterStats } from './Character';
import { dice } from './util';

// Rat
const ratStats: CharacterStats = {
    attackBonus: -3,
    damage: dice['1d4'],
    damageBonus: 0,
    critRange: 20,
    critMult: 2,
    armorClass: 8,
    physResist: 0,
    magicResist: 0,
    maxHealth: 5,
    maxMana: 0, 
    manaPerAtk: 0,
    manaRegen: 0,
    initiativeBonus: 0
};

// Fighter
const fighterStats: CharacterStats = {
    attackBonus: 0,
    damage: dice['1d6'],
    damageBonus: 0,
    critRange: 20,
    critMult: 2,
    armorClass: 10,
    physResist: 0,
    magicResist: 0,
    maxHealth: 12,
    maxMana: 10, 
    manaPerAtk: 2,
    manaRegen: 1,
    initiativeBonus: 0
};

// Rogue
const rogueStats: CharacterStats = {
    attackBonus: 0,
    damage: dice['1d6'],
    damageBonus: 0,
    critRange: 20,
    critMult: 2,
    armorClass: 10,
    physResist: 0,
    magicResist: 0,
    maxHealth: 10,
    maxMana: 10, 
    manaPerAtk: 2,
    manaRegen: 1,
    initiativeBonus: 0
};

export { ratStats, fighterStats, rogueStats };