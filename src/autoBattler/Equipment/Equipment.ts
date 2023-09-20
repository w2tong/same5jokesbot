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
        mainHand: weapons.swo1
    },
    [ClassName.Rogue]: {
        mainHand: weapons.dag1,
        offHandWeapon: weapons.dag1
    },
    [ClassName.Wizard]: {
        mainHand: weapons.sta1
    }
};

export { Equipment, defaultEquipment };