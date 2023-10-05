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
    light: boolean;
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

type WeaponId = 
'unarmed0' | 
'longsword0' | 'longsword1' | 'longsword2' | 'longsword3' | 'longsword4' | 'longsword5' |
'greatsword0' | 'greatsword1' | 'greatsword2' | 'greatsword3' | 'greatsword4' | 'greatsword5' |
'dagger0' | 'dagger1' | 'dagger2' |  'dagger3' |  'dagger4' |  'dagger5' | 
'quarterstaff0' | 'quarterstaff1' | 'quarterstaff2' | 'quarterstaff3' | 'quarterstaff4' | 'quarterstaff5' |
'poisonbite0' | 'poisonbite1'
const weapons: {[id in WeaponId]: Weapon} = {
    // Unarmed
    unarmed0: {
        id: 'unarmed0',
        itemType: ItemType.Weapon,
        name: 'Unarmed',
        type: WeaponType.Unarmed,
        range: RangeType.Melee,
        light: true,
        twoHanded: false,
        attackBonus: 0,
        damageType: DamageType.Physical,
        damage: dice['1d4'],
        damageBonus: 0,
        critRange: 20,
        critMult: 2,
        manaPerAtk: 10,
    },
    // Longswords
    longsword0: {
        id: 'longsword0',
        itemType: ItemType.Weapon,
        name: 'Longsword',
        type: WeaponType.Longsword,
        range: RangeType.Melee,
        light: false,
        twoHanded: false,
        attackBonus: 0,
        damageType: DamageType.Physical,
        damage: dice['1d6'],
        damageBonus: 0,
        critRange: 20,
        critMult: 2,
        manaPerAtk: 10,
    },
    longsword1: {
        id: 'longsword1',
        itemType: ItemType.Weapon,
        name: 'Longsword +1',
        type: WeaponType.Longsword,
        range: RangeType.Melee,
        light: false,
        twoHanded: false,
        attackBonus: 1,
        damageType: DamageType.Physical,
        damage: dice['1d6'],
        damageBonus: 1,
        critRange: 20,
        critMult: 2,
        manaPerAtk: 10,
    },
    longsword2: {
        id: 'longsword2',
        itemType: ItemType.Weapon,
        name: 'Longsword +2',
        type: WeaponType.Longsword,
        range: RangeType.Melee,
        light: false,
        twoHanded: false,
        attackBonus: 2,
        damageType: DamageType.Physical,
        damage: dice['1d6'],
        damageBonus: 2,
        critRange: 20,
        critMult: 2,
        manaPerAtk: 10,
    },
    longsword3: {
        id: 'longsword3',
        itemType: ItemType.Weapon,
        name: 'Longsword +3',
        type: WeaponType.Longsword,
        range: RangeType.Melee,
        light: false,
        twoHanded: false,
        attackBonus: 3,
        damageType: DamageType.Physical,
        damage: dice['1d6'],
        damageBonus: 3,
        critRange: 20,
        critMult: 2,
        manaPerAtk: 10,
    },
    longsword4: {
        id: 'longsword4',
        itemType: ItemType.Weapon,
        name: 'Longsword +4',
        type: WeaponType.Longsword,
        range: RangeType.Melee,
        light: false,
        twoHanded: false,
        attackBonus: 4,
        damageType: DamageType.Physical,
        damage: dice['1d6'],
        damageBonus: 4,
        critRange: 20,
        critMult: 2,
        manaPerAtk: 10,
    },
    longsword5: {
        id: 'longsword5',
        itemType: ItemType.Weapon,
        name: 'Longsword +5',
        type: WeaponType.Longsword,
        range: RangeType.Melee,
        light: false,
        twoHanded: false,
        attackBonus: 5,
        damageType: DamageType.Physical,
        damage: dice['1d6'],
        damageBonus: 5,
        critRange: 20,
        critMult: 2,
        manaPerAtk: 10,
    },
    // Greatswords
    greatsword0: {
        id: 'greatsword0',
        itemType: ItemType.Weapon,
        name: 'Greatsword',
        type: WeaponType.Greatsword,
        range: RangeType.Melee,
        light: false,
        twoHanded: true,
        attackBonus: 0,
        damageType: DamageType.Physical,
        damage: dice['1d8'],
        damageBonus: 0,
        critRange: 20,
        critMult: 2,
        manaPerAtk: 20,
    },
    greatsword1: {
        id: 'greatsword1',
        itemType: ItemType.Weapon,
        name: 'Greatsword +1',
        type: WeaponType.Greatsword,
        range: RangeType.Melee,
        light: false,
        twoHanded: true,
        attackBonus: 1,
        damageType: DamageType.Physical,
        damage: dice['1d8'],
        damageBonus: 1,
        critRange: 20,
        critMult: 2,
        manaPerAtk: 20,
    },
    greatsword2: {
        id: 'greatsword2',
        itemType: ItemType.Weapon,
        name: 'Greatsword +2',
        type: WeaponType.Greatsword,
        range: RangeType.Melee,
        light: false,
        twoHanded: true,
        attackBonus: 2,
        damageType: DamageType.Physical,
        damage: dice['1d8'],
        damageBonus: 2,
        critRange: 20,
        critMult: 2,
        manaPerAtk: 20,
    },
    greatsword3: {
        id: 'greatsword3',
        itemType: ItemType.Weapon,
        name: 'Greatsword +3',
        type: WeaponType.Greatsword,
        range: RangeType.Melee,
        light: false,
        twoHanded: true,
        attackBonus: 3,
        damageType: DamageType.Physical,
        damage: dice['1d8'],
        damageBonus: 3,
        critRange: 20,
        critMult: 2,
        manaPerAtk: 20,
    },
    greatsword4: {
        id: 'greatsword4',
        itemType: ItemType.Weapon,
        name: 'Greatsword +4',
        type: WeaponType.Greatsword,
        range: RangeType.Melee,
        light: false,
        twoHanded: true,
        attackBonus: 4,
        damageType: DamageType.Physical,
        damage: dice['1d8'],
        damageBonus: 4,
        critRange: 20,
        critMult: 2,
        manaPerAtk: 20,
    },
    greatsword5: {
        id: 'greatsword5',
        itemType: ItemType.Weapon,
        name: 'Greatsword +5',
        type: WeaponType.Greatsword,
        range: RangeType.Melee,
        light: false,
        twoHanded: true,
        attackBonus: 5,
        damageType: DamageType.Physical,
        damage: dice['1d8'],
        damageBonus: 5,
        critRange: 20,
        critMult: 2,
        manaPerAtk: 20,
    },
    // Daggers
    dagger0: {
        id: 'dagger0',
        itemType: ItemType.Weapon,
        name: 'Dagger',
        type: WeaponType.Dagger,
        range: RangeType.Melee,
        light: true,
        twoHanded: false,
        attackBonus: 0,
        damageType: DamageType.Physical,
        damage: dice['1d4'],
        damageBonus: 0,
        critRange: 19,
        critMult: 2,
        manaPerAtk: 10,
    },
    dagger1: {
        id: 'dagger1',
        itemType: ItemType.Weapon,
        name: 'Dagger +1',
        type: WeaponType.Dagger,
        range: RangeType.Melee,
        light: true,
        twoHanded: false,
        attackBonus: 1,
        damageType: DamageType.Physical,
        damage: dice['1d4'],
        damageBonus: 1,
        critRange: 19,
        critMult: 2,
        manaPerAtk: 10,
    },
    dagger2: {
        id: 'dagger2',
        itemType: ItemType.Weapon,
        name: 'Dagger +2',
        type: WeaponType.Dagger,
        range: RangeType.Melee,
        light: true,
        twoHanded: false,
        attackBonus: 2,
        damageType: DamageType.Physical,
        damage: dice['1d4'],
        damageBonus: 2,
        critRange: 19,
        critMult: 2,
        manaPerAtk: 10,
    },
    dagger3: {
        id: 'dagger3',
        itemType: ItemType.Weapon,
        name: 'Dagger +3',
        type: WeaponType.Dagger,
        range: RangeType.Melee,
        light: true,
        twoHanded: false,
        attackBonus: 3,
        damageType: DamageType.Physical,
        damage: dice['1d4'],
        damageBonus: 3,
        critRange: 19,
        critMult: 2,
        manaPerAtk: 10,
    },
    dagger4: {
        id: 'dagger4',
        itemType: ItemType.Weapon,
        name: 'Dagger +4',
        type: WeaponType.Dagger,
        range: RangeType.Melee,
        light: true,
        twoHanded: false,
        attackBonus: 4,
        damageType: DamageType.Physical,
        damage: dice['1d4'],
        damageBonus: 4,
        critRange: 19,
        critMult: 2,
        manaPerAtk: 10,
    },
    dagger5: {
        id: 'dagger5',
        itemType: ItemType.Weapon,
        name: 'Dagger +5',
        type: WeaponType.Dagger,
        range: RangeType.Melee,
        light: true,
        twoHanded: false,
        attackBonus: 5,
        damageType: DamageType.Physical,
        damage: dice['1d4'],
        damageBonus: 5,
        critRange: 19,
        critMult: 2,
        manaPerAtk: 10,
    },
    // Staves
    quarterstaff0: {
        id: 'quarterstaff0',
        itemType: ItemType.Weapon,
        name: 'Quarterstaff',
        type: WeaponType.Quarterstaff,
        range: RangeType.Melee,
        light: false,
        twoHanded: true,
        attackBonus: 0,
        damageType: DamageType.Physical,
        damage: dice['1d6'],
        damageBonus: 0,
        critRange: 20,
        critMult: 2,
        manaPerAtk: 20,
        manaRegen: 10
    },
    quarterstaff1: {
        id: 'quarterstaff1',
        itemType: ItemType.Weapon,
        name: 'Quarterstaff +1',
        type: WeaponType.Quarterstaff,
        range: RangeType.Melee,
        light: false,
        twoHanded: true,
        attackBonus: 1,
        damageType: DamageType.Physical,
        damage: dice['1d6'],
        damageBonus: 1,
        critRange: 20,
        critMult: 2,
        manaPerAtk: 20,
        manaRegen: 10
    },
    quarterstaff2: {
        id: 'quarterstaff2',
        itemType: ItemType.Weapon,
        name: 'Quarterstaff +2',
        type: WeaponType.Quarterstaff,
        range: RangeType.Melee,
        light: false,
        twoHanded: true,
        attackBonus: 2,
        damageType: DamageType.Physical,
        damage: dice['1d6'],
        damageBonus: 2,
        critRange: 20,
        critMult: 2,
        manaPerAtk: 20,
        manaRegen: 10
    },
    quarterstaff3: {
        id: 'quarterstaff3',
        itemType: ItemType.Weapon,
        name: 'Quarterstaff +3',
        type: WeaponType.Quarterstaff,
        range: RangeType.Melee,
        light: false,
        twoHanded: true,
        attackBonus: 3,
        damageType: DamageType.Physical,
        damage: dice['1d6'],
        damageBonus: 3,
        critRange: 20,
        critMult: 2,
        manaPerAtk: 20,
        manaRegen: 10
    },
    quarterstaff4: {
        id: 'quarterstaff4',
        itemType: ItemType.Weapon,
        name: 'Quarterstaff +4',
        type: WeaponType.Quarterstaff,
        range: RangeType.Melee,
        light: false,
        twoHanded: true,
        attackBonus: 4,
        damageType: DamageType.Physical,
        damage: dice['1d6'],
        damageBonus: 4,
        critRange: 20,
        critMult: 2,
        manaPerAtk: 20,
        manaRegen: 10
    },
    quarterstaff5: {
        id: 'quarterstaff5',
        itemType: ItemType.Weapon,
        name: 'Quarterstaff +5',
        type: WeaponType.Quarterstaff,
        range: RangeType.Melee,
        light: false,
        twoHanded: true,
        attackBonus: 5,
        damageType: DamageType.Physical,
        damage: dice['1d6'],
        damageBonus: 5,
        critRange: 20,
        critMult: 2,
        manaPerAtk: 20,
        manaRegen: 10
    },
    // NPC Weapons
    // Poison Bite
    poisonbite0: {
        id: 'poisonbite0',
        itemType: ItemType.Weapon,
        name: 'Poison Bite',
        type: WeaponType.Unarmed,
        range: RangeType.Melee,
        light: false,
        twoHanded: true,
        attackBonus: 0,
        damageType: DamageType.Physical,
        damage: dice['1d3'],
        damageBonus: 0,
        critRange: 20,
        critMult: 2,
        manaPerAtk: 0,
        onHit: {
            func: (self: Character, target: Character) => {
                target.buffTracker.addDebuff(DebuffId.Poison, 1, self);
            },
            description: 'Inflict 1 Poison on hit.'
        }
    },
    poisonbite1: {
        id: 'poisonbite1',
        itemType: ItemType.Weapon,
        name: 'Poison Bite',
        type: WeaponType.Unarmed,
        range: RangeType.Melee,
        light: false,
        twoHanded: true,
        attackBonus: 0,
        damageType: DamageType.Physical,
        damage: dice['1d4'],
        damageBonus: 0,
        critRange: 20,
        critMult: 2,
        manaPerAtk: 0,
        onHit: {
            func: (self: Character, target: Character) => {
                target.buffTracker.addDebuff(DebuffId.Poison, 2, self);
            },
            description: 'Inflict 2 Poison on hit.'
        }
    }
} as const;

function getWeaponTooltip(weapon: Weapon) {
    const tooltip = [
        `${weapon.type}, ${weapon.range}`,
        `${bold('Damage')}: ${weapon.damage.num + weapon.damageBonus} - ${weapon.damage.num * weapon.damage.sides + weapon.damageBonus} ${weapon.damageType}`,
        `${bold('Crit')}: ${weapon.critRange < 20 ? `${weapon.critRange}-` : ''}20 (x${weapon.critMult})`, `${bold('Mana/Atk')}: ${weapon.manaPerAtk}`
    ];
    if (weapon.attackBonus) tooltip.push(`${bold('Attack Bonus')}: ${weapon.attackBonus}`);
    if (weapon.onHit) tooltip.push(weapon.onHit.description);
    return tooltip.join('\n');
}

function getWeaponDescription(weapon: Weapon) {
    const descriptions = [];
    if (weapon.twoHanded) {
        descriptions.push('Two-Handed');
    }
    descriptions.push(`Damage: ${weapon.damage.num + weapon.damageBonus} - ${weapon.damage.num * weapon.damage.sides + weapon.damageBonus}`);
    descriptions.push(`Crit: ${weapon.critRange < 20 ? `${weapon.critRange}-` : ''}20 (x${weapon.critMult})`);
    descriptions.push(`MP/ATK: ${weapon.manaPerAtk}`);
    if (weapon.manaRegen) descriptions.push(`MP Regen: ${weapon.manaRegen}`);
    return descriptions.join(', ');
}

export { WeaponType, RangeType, Weapon, WeaponId, weapons, getWeaponTooltip, getWeaponDescription };