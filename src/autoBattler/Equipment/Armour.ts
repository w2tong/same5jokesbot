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

function getArmourDescription(armour: Armour) {
    const descriptions = [`AC: ${armour.armourClass}`];
    if (armour.manaRegen) descriptions.push(`MP Regen: ${armour.manaRegen}`);
    return descriptions.join(', ');
}

type ArmourId = 
'robe0' |
'lightarmour0' |
'mediumarmour0' |
'heavyarmour0'
;

const armour: {[id in ArmourId]: Armour} = {
    robe0: {
        id: 'robe0',
        itemType: ItemType.Armour,
        name: 'Robe',
        type: ArmourType.Unarmoured,
        armourClass: 0,
        manaRegen: 1
    },
    lightarmour0: {
        id: 'lightarmour0',
        itemType: ItemType.Armour,
        name: 'Light Armour',
        type: ArmourType.Light,
        armourClass: 1,
        manaRegen: 0.5
    },
    mediumarmour0: {
        id: 'mediumarmour0',
        itemType: ItemType.Armour,
        name: 'Medium Armour',
        type: ArmourType.Medium,
        armourClass: 2,
        manaRegen: 0.25
    },
    heavyarmour0: {
        id: 'heavyarmour0',
        itemType: ItemType.Armour,
        name: 'Heavy Armour',
        type: ArmourType.Heavy,
        armourClass: 3,
    }
};

export { Armour, getArmourDescription, ArmourId, armour };