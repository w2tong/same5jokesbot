import { DebuffId } from '../Buffs/buffs';
import Character from '../Character';
import { DamageType, Dice, dice } from '../util';
import { Item, ItemType } from './Item';

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
interface Weapon extends Item {
    itemType: ItemType.Weapon
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
    onHit?: (self: Character, target: Character) => void;
}

type WeaponId = 
'ua0' | 
'ls0' | 'ls1' | 
'gs0' | 'gs1' |
'da0' | 'da1' | 
'qs0' | 'qs1' |
'pb0'
const weapons: {[id in WeaponId]: Weapon} = {
    // Unarmed
    ua0: {
        id: 'ua0',
        itemType: ItemType.Weapon,
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
    ls0: {
        id: 'ls0',
        itemType: ItemType.Weapon,
        name: 'Longsword',
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
    ls1: {
        id: 'ls1',
        itemType: ItemType.Weapon,
        name: 'Longsword +1',
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
    gs0: {
        id: 'gs0',
        itemType: ItemType.Weapon,
        name: 'Greatsword',
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
    gs1: {
        id: 'gs1',
        itemType: ItemType.Weapon,
        name: 'Greatsword +1',
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
    da0: {
        id: 'da0',
        itemType: ItemType.Weapon,
        name: 'Dagger',
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
    da1: {
        id: 'da1',
        itemType: ItemType.Weapon,
        name: 'Dagger +1',
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
    qs0: {
        id: 'qs0',
        itemType: ItemType.Weapon,
        name: 'Quarterstaff',
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
    },
    qs1: {
        id: 'qs1',
        itemType: ItemType.Weapon,
        name: 'Quarterstaff +1',
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
    },
    // NPC Weapons
    // Poison Bite
    pb0: {
        id: 'pb0',
        itemType: ItemType.Weapon,
        name: 'Poison Bite',
        type: WeaponType.Unarmed,
        range: RangeType.Melee,
        twoHanded: false,
        attackBonus: 0,
        damageType: DamageType.Physical,
        damage: dice['1d3'],
        damageBonus: 0,
        critRange: 20,
        critMult: 2,
        manaPerAtk: 1,
        onHit: (self: Character, target: Character) => {
            target.buffTracker.addDebuff(DebuffId.Poison, 1, self);
        }
    }
} as const;

export { Weapon, WeaponId, weapons };