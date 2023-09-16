import { CharacterStats } from './Character';
import { ClassName } from './Classes/classes';
import { DamageType, dice } from './util';

const ClassStats: {[name in ClassName]: CharacterStats} = {
    Fighter: {
        level: 1,
        attackBonus: 0,
        damage: dice['1d6'],
        damageBonus: 0,
        damageType: DamageType.Physical,
        critRange: 20,
        critMult: 2,
        armorClass: 10,
        physResist: 0,
        magicResist: 0,
        maxHealth: 20,
        maxMana: 10, 
        manaPerAtk: 2,
        manaRegen: 1,
        initiativeBonus: 0
    },
    Rogue: {
        level: 1,
        attackBonus: 0,
        damage: dice['1d6'],
        damageBonus: 0,
        damageType: DamageType.Physical,
        critRange: 20,
        critMult: 2,
        armorClass: 10,
        physResist: 0,
        magicResist: 0,
        maxHealth: 20,
        maxMana: 10, 
        manaPerAtk: 2,
        manaRegen: 1,
        initiativeBonus: 0
    },
    Wizard: {
        level: 1,
        attackBonus: 0,
        damage: dice['1d4'],
        damageBonus: 0,
        damageType: DamageType.Physical,
        critRange: 20,
        critMult: 2,
        armorClass: 10,
        physResist: 0,
        magicResist: 0,
        maxHealth: 20,
        maxMana: 10, 
        manaPerAtk: 1,
        manaRegen: 3,
        initiativeBonus: 0
    }
};

// Rat
const RatStats: CharacterStats = {
    level: 1,
    attackBonus: -3,
    damage: dice['1d2'],
    damageBonus: 0,
    damageType: DamageType.Physical,
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

export { ClassStats, RatStats };