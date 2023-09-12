import { CharacterStats } from './Character';
import { dice } from './util';

// Fighter
const fighterStats: CharacterStats = {
    attackBonus: 0,
    damage: dice['1d6'],
    damageBonus: 0,
    armorClass: 10,
    physResist: 0,
    magicResist: 0,
    maxHealth: 10,
    maxMana: 0, 
    manaPerAtk: 0,
    manaRegen: 0,
    initiativeBonus: 0
};

export { fighterStats };