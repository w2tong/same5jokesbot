import { CharacterStats } from './Character';
import { dice } from './util';

// Fighter
const fighterStats: CharacterStats = {
    attackBonus: 1,
    damage: dice['1d6'],
    damageBonus: 1,
    critRange: 20,
    critMult: 2,
    armorClass: 10,
    physResist: 0,
    magicResist: 0,
    maxHealth: 100,
    maxMana: 0, 
    manaPerAtk: 0,
    manaRegen: 0,
    initiativeBonus: 0
};

export { fighterStats };