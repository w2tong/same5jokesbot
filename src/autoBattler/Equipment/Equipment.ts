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
        mainHand: weapons.gs0
    },
    [ClassName.Rogue]: {
        mainHand: weapons.da0,
        offHandWeapon: weapons.da0
    },
    [ClassName.Wizard]: {
        mainHand: weapons.qs0
    }
};

export { Equipment, defaultEquipment };