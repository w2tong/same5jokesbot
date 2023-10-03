import { getABEquipmentItemIds } from '../../sql/tables/ab_equipment';
import { ClassName } from '../Classes/classes';
import { Armour, ArmourId, armour, getArmourDescription, getArmourTooltip } from './Armour';
import { ItemType } from './Item';
import { Shield, getShieldDescription, getShieldTooltip, shields } from './Shield';
import { Weapon, WeaponId, getWeaponDescription, getWeaponTooltip, weapons } from './Weapons';

type Equip = Weapon|Shield|Armour;
const equips: {[key: string]: Equip} = {...weapons, ...shields, ...armour} as const;

type Equipment = {
    mainHand?: Weapon
    offHandWeapon?: Weapon
    offHandShield?: Shield
    armour?: Armour
}

const defaultEquipment: {[name in ClassName]: Equipment} = {
    [ClassName.Fighter]: {
        mainHand: weapons.greatsword0,
    },
    [ClassName.Rogue]: {
        mainHand: weapons.dagger0,
        offHandWeapon: weapons.dagger0
    },
    [ClassName.Wizard]: {
        mainHand: weapons.quarterstaff0
    }
};

async function fetchEquipment(userId: string, name: string): Promise<Equipment> {
    const dbEquipment = await getABEquipmentItemIds(userId, name);
    if (!dbEquipment) {
        return {};
    }
    const equipment: Equipment = {};
    // Main Hand
    if (dbEquipment.MAIN_HAND && dbEquipment.MAIN_HAND in weapons) {
        equipment.mainHand = weapons[dbEquipment.MAIN_HAND as WeaponId];
    }
    // Off Hand
    if (dbEquipment.OFF_HAND && equips[dbEquipment.OFF_HAND]) {
        const offHand = equips[dbEquipment.OFF_HAND];
        if (offHand.itemType === ItemType.Weapon) {
            equipment.offHandWeapon = offHand;
        }
        else if (offHand.itemType === ItemType.Shield) {
            equipment.offHandShield = offHand;
        }
    }
    // Armour
    if (dbEquipment.ARMOUR && dbEquipment.ARMOUR in armour) {
        equipment.armour = armour[dbEquipment.ARMOUR as ArmourId];
    }
    
    return equipment;
}

function getItemTooltip(item: Equip): string {
    if (item.itemType === ItemType.Weapon) return getWeaponTooltip(item);
    else if (item.itemType === ItemType.Shield) return getShieldTooltip(item);
    else if (item.itemType === ItemType.Armour) return getArmourTooltip(item);
    return 'Missing item tooltip.';
}

function getItemDescription(itemId: string) {
    const item = equips[itemId];
    if (!item) throw Error(`Item id ${itemId} does not exist`);
    if (item.itemType === ItemType.Weapon) return getWeaponDescription(item);
    else if (item.itemType === ItemType.Shield) return getShieldDescription(item);
    else if (item.itemType === ItemType.Armour) return getArmourDescription(item);
    return 'Missing item description.';
}

export { Equip, equips, Equipment, defaultEquipment, fetchEquipment, getItemTooltip, getItemDescription };