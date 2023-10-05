import { ABCharacter } from '../sql/tables/ab_characters';
import { Classes } from './Classes/classes';
import { fetchEquipment, defaultEquipment } from './Equipment/Equipment';
import { weapons } from './Equipment/Weapons';
import { PlayerStats } from './statTemplates';

async function createPlayerChar(userId: string, char: ABCharacter) {
    const equipment = await fetchEquipment(userId, char.CHAR_NAME);
    const classDefault = defaultEquipment[char.CLASS_NAME];
    // Set main hand to class default weapon if missing
    if (classDefault.mainHand && !equipment.mainHand) {
        if ((classDefault.mainHand.twoHanded && !equipment.offHandWeapon && !equipment.offHandShield) || !classDefault.mainHand.twoHanded) {
            equipment.mainHand = classDefault.mainHand;
        }
        else {
            equipment.mainHand = weapons.unarmed0;
        }
    }
    // Set off hand to class default weapon/shield if missing and main hand is not two-handed
    if ((classDefault.offHandWeapon || classDefault.offHandShield) && !equipment.offHandWeapon && !equipment.offHandShield && equipment.mainHand && !equipment.mainHand.twoHanded) {
        equipment.offHandWeapon = classDefault.offHandWeapon;
        equipment.offHandShield = classDefault.offHandShield;
    }
    return new Classes[char.CLASS_NAME](char.CHAR_LEVEL, PlayerStats[char.CLASS_NAME], equipment, char.CHAR_NAME, {userId});
}

export { createPlayerChar };