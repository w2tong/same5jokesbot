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
        mainHand: weapons.greatsword0
    },
    [ClassName.Rogue]: {
        mainHand: weapons.dagger0,
        offHandWeapon: weapons.dagger0
    },
    [ClassName.Wizard]: {
        mainHand: weapons.quarterstaff0
    }
};

export { Equipment, defaultEquipment };