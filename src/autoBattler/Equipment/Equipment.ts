import { ClassName } from '../Classes/classes';
import { Shield } from './Shield';
import { Weapon, weapons } from './Weapons';

type Equipment = {
    mainHand: Weapon
    offHandWeapon?: Weapon
    offHandShield?: Shield
}

const defaultEquipment: {[name in ClassName]: Equipment} = {
    [ClassName.Fighter]: {
        mainHand: weapons.gs1
    },
    [ClassName.Rogue]: {
        mainHand: weapons.da1,
        offHandWeapon: weapons.da1
    },
    [ClassName.Wizard]: {
        mainHand: weapons.qs1
    }
};

export { Equipment, defaultEquipment };