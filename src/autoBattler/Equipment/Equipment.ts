import { getABEquipmentItemIds } from '../../sql/tables/ab_equipment';
import { ClassName } from '../Classes/classes';
import { Armour, ArmourId, armour, getArmourDescription, getArmourTooltip } from './Armour';
import { Hands, HandsId, getHandsDescription, getHandsTooltip, hands } from './Hands';
import { Head, HeadId, getHeadDescription, getHeadTooltip, heads } from './Head';
import { ItemType } from './Item';
import { Ring, RingId, getRingDescription, getRingTooltip, rings } from './Ring';
import { Shield, getShieldDescription, getShieldTooltip, shields } from './Shield';
import { Weapon, WeaponId, getWeaponDescription, getWeaponTooltip, weapons } from './Weapons';

type Equip = Weapon|Shield|Armour|Head|Hands|Ring;
const equips: {[key: string]: Equip} = {...weapons, ...shields, ...armour, ...heads, ...hands, ...rings} as const;

type Equipment = {
    mainHand?: Weapon;
    offHandWeapon?: Weapon;
    offHandShield?: Shield;
    armour?: Armour;
    head?: Head;
    hands?: Hands;
    ring1?: Ring;
    ring2?: Ring;
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

    // Head
    if (dbEquipment.HEAD && dbEquipment.HEAD in heads) {
        equipment.head = heads[dbEquipment.HEAD as HeadId];
    }

    // Hands
    if (dbEquipment.HANDS && dbEquipment.HANDS in hands) {
        equipment.hands = hands[dbEquipment.HANDS as HandsId];
    }

    // Rings
    if (dbEquipment.RING1 && dbEquipment.RING1 in rings) {
        equipment.ring1 = rings[dbEquipment.RING1 as RingId];
    }
    if (dbEquipment.RING2 && dbEquipment.RING2 in rings) {
        equipment.ring2 = rings[dbEquipment.RING2 as RingId];
    }
    
    return equipment;
}

function getItemTooltip(item: Equip): string {
    if (item.itemType === ItemType.Weapon) return getWeaponTooltip(item);
    else if (item.itemType === ItemType.Shield) return getShieldTooltip(item);
    else if (item.itemType === ItemType.Armour) return getArmourTooltip(item);
    else if (item.itemType === ItemType.Head) return getHeadTooltip(item);
    else if (item.itemType === ItemType.Hands) return getHandsTooltip(item);
    else if (item.itemType === ItemType.Ring) return getRingTooltip(item);
    return 'Missing item tooltip.';
}

function getItemDescription(item: Equip) {
    if (item.itemType === ItemType.Weapon) return getWeaponDescription(item);
    else if (item.itemType === ItemType.Shield) return getShieldDescription(item);
    else if (item.itemType === ItemType.Armour) return getArmourDescription(item);
    else if (item.itemType === ItemType.Head) return getHeadDescription(item);
    else if (item.itemType === ItemType.Hands) return getHandsDescription(item);
    else if (item.itemType === ItemType.Ring) return getRingDescription(item);
    return 'Missing item description.';
}

export { Equip, equips, Equipment, defaultEquipment, fetchEquipment, getItemTooltip, getItemDescription };