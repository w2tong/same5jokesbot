import { Item, ItemType } from './Item';

enum ShieldType {
    Light = 'Light',
    Medium = 'Medium',
    Heavy = 'Heavy'
}

interface Shield extends Item {
    itemType: ItemType.Shield;
    type: ShieldType;
    armourClass: number;
    physDR?: number;
    magicDR?: number;
    physResist?: number;
    magicResist?: number;
}

type ShieldId = 'buckler0' | 'buckler1' | 'buckler2' | 'buckler3' | 'buckler4' | 'buckler5'
const shields: {[id in ShieldId]: Shield} = {
    buckler0: {
        id: 'buckler0',
        name: 'Buckler',
        itemType: ItemType.Shield,
        type: ShieldType.Light,
        armourClass: 1
    },
    buckler1: {
        id: 'buckler1',
        name: 'Buckler +1',
        itemType: ItemType.Shield,
        type: ShieldType.Light,
        armourClass: 1
    },
    buckler2: {
        id: 'buckler2',
        name: 'Buckler +2',
        itemType: ItemType.Shield,
        type: ShieldType.Light,
        armourClass: 2
    },
    buckler3: {
        id: 'buckler3',
        name: 'Buckler +3',
        itemType: ItemType.Shield,
        type: ShieldType.Light,
        armourClass: 3
    },
    buckler4: {
        id: 'buckler4',
        name: 'Buckler +4',
        itemType: ItemType.Shield,
        type: ShieldType.Light,
        armourClass: 4
    },
    buckler5: {
        id: 'buckler5',
        name: 'Buckler +5',
        itemType: ItemType.Shield,
        type: ShieldType.Light,
        armourClass: 5
    }
};

function getShieldTooltip(shield: Shield) {
    const tooltip = [`AC: ${shield.armourClass}`];
    return tooltip.join('\n');
}

function getShieldDescription(shield: Shield) {
    const descriptions = [`AC: ${shield.armourClass}`];
    return descriptions.join(', ');
}

export { Shield, getShieldTooltip, getShieldDescription, ShieldId, shields };