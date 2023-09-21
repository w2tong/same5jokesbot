import { DamageType, Dice, dice } from '../util';

enum WeaponType {
    Unarmed = 'Unarmed',
    Longsword = 'Longsword',
    Greatsword = 'Greatsword',
    Dagger = 'Dagger',
    Quarterstaff = 'Quarterstaff'
}
enum RangeType {
    Melee = 'Melee',
    ShortRange = 'ShortRange',
    LongRange = 'LongRange'
}
type Weapon = {
    name: string;
    type: WeaponType;
    range: RangeType;
    twoHanded: boolean;
    damageType: DamageType;
    damage: Dice;
    critRange: number;
    critMult: number;
    attackBonus: number;
    damageBonus: number;
    manaPerAtk: number;
    manaRegen?: number;
}

type WeaponId = 'ua1' | 
'gs1' | 
'ls1' |
'da1' | 
'qs1'
const weapons: {[id in WeaponId]: Weapon} = {
    // Unarmed
    ua1: {
        name: 'Unarmed',
        type: WeaponType.Unarmed,
        range: RangeType.Melee,
        twoHanded: false,
        attackBonus: 0,
        damageType: DamageType.Physical,
        damage: dice['1d4'],
        damageBonus: 0,
        critRange: 20,
        critMult: 2,
        manaPerAtk: 1,
    },
    // Longswords
    ls1: {
        name: 'Rusty Longsword',
        type: WeaponType.Longsword,
        range: RangeType.Melee,
        twoHanded: true,
        attackBonus: 0,
        damageType: DamageType.Physical,
        damage: dice['1d6'],
        damageBonus: 0,
        critRange: 20,
        critMult: 2,
        manaPerAtk: 2,
    },
    // Greatswords
    gs1: {
        name: 'Rusty Greatsword',
        type: WeaponType.Greatsword,
        range: RangeType.Melee,
        twoHanded: true,
        attackBonus: 0,
        damageType: DamageType.Physical,
        damage: dice['1d8'],
        damageBonus: 0,
        critRange: 20,
        critMult: 2,
        manaPerAtk: 2,
    },
    // Daggers
    da1: {
        name: 'Rusty Dagger',
        type: WeaponType.Dagger,
        range: RangeType.Melee,
        twoHanded: false,
        attackBonus: 0,
        damageType: DamageType.Physical,
        damage: dice['1d4'],
        damageBonus: 0,
        critRange: 19,
        critMult: 2,
        manaPerAtk: 1,
    },
    // Staves
    qs1: {
        name: 'Rotten Quarterstaff',
        type: WeaponType.Quarterstaff,
        range: RangeType.Melee,
        twoHanded: true,
        attackBonus: 0,
        damageType: DamageType.Physical,
        damage: dice['1d6'],
        damageBonus: 0,
        critRange: 20,
        critMult: 2,
        manaPerAtk: 2,
    }
} as const;

export { Weapon, weapons };