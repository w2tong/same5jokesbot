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

function getShieldDescription(shield: Shield) {
    const descriptions = [`AC: ${shield.armourClass}`];
    return descriptions.join(', ');
}

type ShieldId = 'buckler0'
const shields: {[id in ShieldId]: Shield} = {
    buckler0: {
        id: 'buckler0',
        name: 'Buckler',
        itemType: ItemType.Shield,
        type: ShieldType.Light,
        armourClass: 1
    }
};

export { Shield, getShieldDescription, ShieldId, shields };