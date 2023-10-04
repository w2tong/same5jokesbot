import { bold } from 'discord.js';
import Character from '../Character';
import { Item, ItemType } from './Item';

enum ArmourType {
    Unarmoured = 'Unarmoured',
    Light = 'Light',
    Medium = 'Medium',
    Heavy = 'Heavy',
}

interface Armour extends Item {
    itemType: ItemType.Armour
    type: ArmourType;
    armourClass: number
    manaRegen?: number;
    onHit?: {
        func: (self: Character, target: Character) => void;
        description: string;
    }
}

type ArmourId = 
'robe0' | 'robe1' | 'robe2' | 'robe3' | 'robe4' | 'robe5' |
'lightarmour0' | 'lightarmour1' | 'lightarmour2' | 'lightarmour3' | 'lightarmour4' | 'lightarmour5' |
'mediumarmour0' | 'mediumarmour1' | 'mediumarmour2' | 'mediumarmour3' | 'mediumarmour4' | 'mediumarmour5' |
'heavyarmour0' | 'heavyarmour1' |  'heavyarmour2' |  'heavyarmour3' |  'heavyarmour4' |  'heavyarmour5'
;

const armour: {[id in ArmourId]: Armour} = {
    robe0: {
        id: 'robe0',
        itemType: ItemType.Armour,
        name: 'Robe',
        type: ArmourType.Unarmoured,
        armourClass: 0,
        manaRegen: 10
    },
    robe1: {
        id: 'robe1',
        itemType: ItemType.Armour,
        name: 'Robe +1',
        type: ArmourType.Unarmoured,
        armourClass: 1,
        manaRegen: 11
    },
    robe2: {
        id: 'robe2',
        itemType: ItemType.Armour,
        name: 'Robe +2',
        type: ArmourType.Unarmoured,
        armourClass: 2,
        manaRegen: 12
    },
    robe3: {
        id: 'robe3',
        itemType: ItemType.Armour,
        name: 'Robe +3',
        type: ArmourType.Unarmoured,
        armourClass: 3,
        manaRegen: 13
    },
    robe4: {
        id: 'robe4',
        itemType: ItemType.Armour,
        name: 'Robe +4',
        type: ArmourType.Unarmoured,
        armourClass: 4,
        manaRegen: 14
    },
    robe5: {
        id: 'robe5',
        itemType: ItemType.Armour,
        name: 'Robe +5',
        type: ArmourType.Unarmoured,
        armourClass: 5,
        manaRegen: 15
    },
    lightarmour0: {
        id: 'lightarmour0',
        itemType: ItemType.Armour,
        name: 'Light Armour',
        type: ArmourType.Light,
        armourClass: 1,
        manaRegen: 5
    },
    lightarmour1: {
        id: 'lightarmour1',
        itemType: ItemType.Armour,
        name: 'Light Armour +1',
        type: ArmourType.Light,
        armourClass: 2,
        manaRegen: 6
    },
    lightarmour2: {
        id: 'lightarmour2',
        itemType: ItemType.Armour,
        name: 'Light Armour +2',
        type: ArmourType.Light,
        armourClass: 3,
        manaRegen: 7
    },
    lightarmour3: {
        id: 'lightarmour3',
        itemType: ItemType.Armour,
        name: 'Light Armour +3',
        type: ArmourType.Light,
        armourClass: 4,
        manaRegen: 8
    },
    lightarmour4: {
        id: 'lightarmour4',
        itemType: ItemType.Armour,
        name: 'Light Armour +4',
        type: ArmourType.Light,
        armourClass: 5,
        manaRegen: 9
    },
    lightarmour5: {
        id: 'lightarmour5',
        itemType: ItemType.Armour,
        name: 'Light Armour +5',
        type: ArmourType.Light,
        armourClass: 6,
        manaRegen: 10
    },
    mediumarmour0: {
        id: 'mediumarmour0',
        itemType: ItemType.Armour,
        name: 'Medium Armour',
        type: ArmourType.Medium,
        armourClass: 2,
        manaRegen: 1
    },
    mediumarmour1: {
        id: 'mediumarmour1',
        itemType: ItemType.Armour,
        name: 'Medium Armour +1',
        type: ArmourType.Medium,
        armourClass: 3,
        manaRegen: 2
    },
    mediumarmour2: {
        id: 'mediumarmour2',
        itemType: ItemType.Armour,
        name: 'Medium Armour +2',
        type: ArmourType.Medium,
        armourClass: 4,
        manaRegen: 3
    },
    mediumarmour3: {
        id: 'mediumarmour3',
        itemType: ItemType.Armour,
        name: 'Medium Armour +3',
        type: ArmourType.Medium,
        armourClass: 5,
        manaRegen: 4
    },
    mediumarmour4: {
        id: 'mediumarmour4',
        itemType: ItemType.Armour,
        name: 'Medium Armour +4',
        type: ArmourType.Medium,
        armourClass: 6,
        manaRegen: 5
    },
    mediumarmour5: {
        id: 'mediumarmour5',
        itemType: ItemType.Armour,
        name: 'Medium Armour +5',
        type: ArmourType.Medium,
        armourClass: 2,
        manaRegen: 6
    },
    heavyarmour0: {
        id: 'heavyarmour0',
        itemType: ItemType.Armour,
        name: 'Heavy Armour',
        type: ArmourType.Heavy,
        armourClass: 3,
    },
    heavyarmour1: {
        id: 'heavyarmour1',
        itemType: ItemType.Armour,
        name: 'Heavy Armour +1',
        type: ArmourType.Heavy,
        armourClass: 4,
    },
    heavyarmour2: {
        id: 'heavyarmour2',
        itemType: ItemType.Armour,
        name: 'Heavy Armour +2',
        type: ArmourType.Heavy,
        armourClass: 5,
    },
    heavyarmour3: {
        id: 'heavyarmour3',
        itemType: ItemType.Armour,
        name: 'Heavy Armour +3',
        type: ArmourType.Heavy,
        armourClass: 6,
    },
    heavyarmour4: {
        id: 'heavyarmour4',
        itemType: ItemType.Armour,
        name: 'Heavy Armour +4',
        type: ArmourType.Heavy,
        armourClass: 7,
    },
    heavyarmour5: {
        id: 'heavyarmour5',
        itemType: ItemType.Armour,
        name: 'Heavy Armour +5',
        type: ArmourType.Heavy,
        armourClass: 8,
    }
};

function getArmourTooltip(armour: Armour) {
    const descriptions = [`${bold('Armour Class')}: ${armour.armourClass}`];
    if (armour.manaRegen) descriptions.push(`${bold('Mana Regen')}: ${armour.manaRegen}`);
    return descriptions.join('\n');
}

function getArmourDescription(armour: Armour) {
    const descriptions = [`AC: ${armour.armourClass}`];
    if (armour.manaRegen) descriptions.push(`MP Regen: ${armour.manaRegen}`);
    return descriptions.join(', ');
}

export { Armour, getArmourTooltip, getArmourDescription, ArmourId, armour };