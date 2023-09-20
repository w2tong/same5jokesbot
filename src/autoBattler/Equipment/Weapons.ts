import { DamageType, Dice, dice } from '../util';

enum WeaponType {
    Unarmed = 'Unarmed',
    Sword = 'Sword',
    Dagger = 'Dagger',
    Staff = 'Staff'
}
enum RangeType {
    Melee = 'Melee',
    ShortRange = 'ShortRange',
    LongRange = 'LongRange'
}
type Weapon = {
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

type WeaponId = 'una1' | 'swo1' | 'dag1' | 'sta1'
const weapons: {[id in WeaponId]: Weapon} = {
    // Unarmed
    una1: {
        type: WeaponType.Unarmed,
        range: RangeType.Melee,
        twoHanded: true,
        attackBonus: 0,
        damageType: DamageType.Physical,
        damage: dice['1d4'],
        damageBonus: 0,
        critRange: 20,
        critMult: 2,
        manaPerAtk: 1,
    },
    // Swords
    swo1: {
        type: WeaponType.Sword,
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
    dag1: {
        type: WeaponType.Sword,
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
    sta1: {
        type: WeaponType.Sword,
        range: RangeType.Melee,
        twoHanded: false,
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