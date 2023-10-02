import { bold } from 'discord.js';
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
    onHit?: {
        func: (self: Character, target: Character) => void;
        description: string;
    }
}

function getWeaponTooltip(weapon: Weapon) {
    const tooltip = [`${weapon.type}, ${weapon.range}`, `${bold('Attack Bonus')}: ${weapon.attackBonus}`, `${bold('Damage')}: ${weapon.damage.num + weapon.damageBonus} - ${weapon.damage.num * weapon.damage.sides + weapon.damageBonus} ${weapon.damageType}`, `${bold('Crit')}: ${weapon.critRange < 20 ? `${weapon.critRange}-` : ''}20 (x${weapon.critMult})`, `${bold('Mana/Atk')}: ${weapon.manaPerAtk}`];
    if (weapon.onHit) {
        tooltip.push(weapon.onHit.description);
    }
    return {
        name: weapon.name,
        tooltip: tooltip.join('\n')
    };
}

type WeaponId = 
'unarmed0' | 
'longsword0' | 'longsword1' | 
'greatsword0' | 'greatsword1' |
'dagger0' | 'dagger1' | 
'quarterstaff0' | 'quarterstaff1' |
'poisonbite0'
const weapons: {[id in WeaponId]: Weapon} = {
    // Unarmed
    unarmed0: {
        id: 'unarmed0',
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
    longsword0: {
        id: 'longsword0',
        itemType: ItemType.Weapon,
        name: 'Longsword',
        type: WeaponType.Longsword,
        range: RangeType.Melee,
        twoHanded: false,
        attackBonus: 0,
        damageType: DamageType.Physical,
        damage: dice['1d6'],
        damageBonus: 0,
        critRange: 20,
        critMult: 2,
        manaPerAtk: 2,
    },
    longsword1: {
        id: 'longsword1',
        itemType: ItemType.Weapon,
        name: 'Longsword +1',
        type: WeaponType.Longsword,
        range: RangeType.Melee,
        twoHanded: false,
        attackBonus: 1,
        damageType: DamageType.Physical,
        damage: dice['1d6'],
        damageBonus: 1,
        critRange: 20,
        critMult: 2,
        manaPerAtk: 2,
    },
    // Greatswords
    greatsword0: {
        id: 'greatsword0',
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
    greatsword1: {
        id: 'greatsword1',
        itemType: ItemType.Weapon,
        name: 'Greatsword +1',
        type: WeaponType.Greatsword,
        range: RangeType.Melee,
        twoHanded: true,
        attackBonus: 1,
        damageType: DamageType.Physical,
        damage: dice['1d8'],
        damageBonus: 1,
        critRange: 20,
        critMult: 2,
        manaPerAtk: 2,
    },
    // Daggers
    dagger0: {
        id: 'dagger0',
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
    dagger1: {
        id: 'dagger1',
        itemType: ItemType.Weapon,
        name: 'Dagger +1',
        type: WeaponType.Dagger,
        range: RangeType.Melee,
        twoHanded: false,
        attackBonus: 1,
        damageType: DamageType.Physical,
        damage: dice['1d4'],
        damageBonus: 1,
        critRange: 19,
        critMult: 2,
        manaPerAtk: 1,
    },
    // Staves
    quarterstaff0: {
        id: 'quarterstaff0',
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
        manaRegen: 1
    },
    quarterstaff1: {
        id: 'quarterstaff1',
        itemType: ItemType.Weapon,
        name: 'Quarterstaff +1',
        type: WeaponType.Quarterstaff,
        range: RangeType.Melee,
        twoHanded: true,
        attackBonus: 1,
        damageType: DamageType.Physical,
        damage: dice['1d6'],
        damageBonus: 1,
        critRange: 20,
        critMult: 2,
        manaPerAtk: 2,
        manaRegen: 1
    },
    // NPC Weapons
    // Poison Bite
    poisonbite0: {
        id: 'poisonbite0',
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
        onHit: {
            func: (self: Character, target: Character) => {
                target.buffTracker.addDebuff(DebuffId.Poison, 1, self);
            },
            description: 'Inflict 1 Poison on hit.'
        }
    }
} as const;

export { Weapon, getWeaponTooltip, WeaponId, weapons };