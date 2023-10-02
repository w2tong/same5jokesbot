import { getABEquipmentItemIds } from '../../sql/tables/ab_equipment';
import { ClassName } from '../Classes/classes';
import { Armour, ArmourId, armour } from './Armour';
import { Shield, ShieldId, shields } from './Shield';
import { Weapon, WeaponId, weapons } from './Weapons';

const items = {...weapons, ...shields, ...armour};

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
    return {
        mainHand: dbEquipment.MAIN_HAND ? weapons[dbEquipment.MAIN_HAND as WeaponId] : undefined,
        offHandWeapon: dbEquipment.OFF_HAND ? dbEquipment.OFF_HAND in weapons ? weapons[dbEquipment.OFF_HAND as WeaponId] : undefined : undefined,
        offHandShield: dbEquipment.OFF_HAND ? dbEquipment.OFF_HAND in shields ? shields[dbEquipment.OFF_HAND as ShieldId] : undefined : undefined,
        armour: dbEquipment.ARMOUR ? armour[dbEquipment.ARMOUR as ArmourId] : undefined
    };
}

export { items, Equipment, defaultEquipment, fetchEquipment };