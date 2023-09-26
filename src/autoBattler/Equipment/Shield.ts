import { Item, ItemType } from './Item';

enum ShieldType {
    Light = 'Light',
    Medium = 'Medium',
    Heavy = 'Heavy'
}

interface Shield extends Item {
    itemType: ItemType.Shield;
    type: ShieldType;
    armorClass: number;
    physDR?: number;
    magicDR?: number;
    physResist?: number;
    magicResist?: number;
}

const shields: {[id: string]: Shield} = {

};

export { Shield, shields };