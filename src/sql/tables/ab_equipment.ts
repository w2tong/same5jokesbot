import oracledb from 'oracledb';
import { selectExecuteOptions } from '../query-options';
import { logError } from '../../logger';
import { WeaponId } from '../../autoBattler/Equipment/Weapons';

const createTableABEquipment = {
    name: 'AB_EQUIPMENT',
    query: `
        CREATE TABLE ab_equipment (
            user_id VARCHAR2(64) NOT NULL,
            char_name VARCHAR2(32) NOT NULL,
            main_hand VARCHAR2(16),
            off_hand VARCHAR2(16),
            head VARCHAR2(16),
            amulet VARCHAR2(16),
            armour VARCHAR2(16),
            hands VARCHAR2(16),
            belt VARCHAR2(16),
            ring1 VARCHAR2(16),
            ring2 VARCHAR2(16),
            potion VARCHAR2(16),
            CONSTRAINT fk_ab_equipment
                FOREIGN KEY (user_id, char_name)
                REFERENCES ab_characters (user_id, char_name)
        )
    `
};

const insertQuery = `
INSERT INTO ab_equipment (user_id, char_name)
VALUES (:userId, :name)
`;

async function insertABEquipment(userId: string, name: string): Promise<boolean> {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(insertQuery, {userId, name});
        await connection.close();
        return true;
    }
    catch (err) {
        logError(err);
        return false;
    }
}

enum EquipSlot {
    MainHand = 'main_hand',
    OffHand = 'off_hand',
    Head = 'head',
    Amulet = 'amulet',
    Armour = 'armour',
    Hands = 'hands',
    Belt = 'belt',
    Ring1 = 'ring1',
    Ring2 = 'ring2',
    Potion = 'potion'
}

const updateQuery = `
CASE 
WHEN :equipSlot = '${EquipSlot.MainHand}' THEN 
    UPDATE ab_equipment SET main_hand = :itemId
    WHERE user_id = :userId
    AND char_name = :name;
WHEN :equipSlot = '${EquipSlot.OffHand}' THEN 
    UPDATE ab_equipment SET off_hand = :itemId
    WHERE user_id = :userId
    AND char_name = :name;
WHEN :equipSlot = '${EquipSlot.Head}' THEN 
    UPDATE ab_equipment SET head = :itemId
    WHERE user_id = :userId
    AND char_name = :name;
WHEN :equipSlot = '${EquipSlot.Amulet}' THEN 
    UPDATE ab_equipment SET amulet = :itemId
    WHERE user_id = :userId
    AND char_name = :name;
WHEN :equipSlot = '${EquipSlot.Armour}' THEN 
    UPDATE ab_equipment SET armour = :itemId
    WHERE user_id = :userId
    AND char_name = :name;
WHEN :equipSlot = '${EquipSlot.Hands}' THEN 
    UPDATE ab_equipment SET hands = :itemId
    WHERE user_id = :userId
    AND char_name = :name
WHEN :equipSlot = '${EquipSlot.Belt}' THEN 
    UPDATE ab_equipment SET belt = :itemId
    WHERE user_id = :userId
    AND char_name = :name;
WHEN :equipSlot = '${EquipSlot.Ring1}' THEN 
    UPDATE ab_equipment SET ring1 = :itemId
    WHERE user_id = :userId
    AND char_name = :name;
WHEN :equipSlot = '${EquipSlot.Ring2}' THEN 
    UPDATE ab_equipment SET ring2 = :itemId
    WHERE user_id = :userId
    AND char_name = :name;
WHEN :equipSlot = '${EquipSlot.Potion}' THEN 
    UPDATE ab_equipment SET potion = :itemId
    WHERE user_id = :userId
    AND char_name = :name;
END CASE
`;

async function updateABEquipment(userId: string, name: string, equipSlot: EquipSlot, itemId: string) {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(updateQuery, {userId, name, equipSlot, itemId});
        await connection.close();
    }
    catch (err) {
        throw new Error(`updateABEquipment: ${err}`);
    }
}

const getEquipmentQuery = `
SELECT *
FROM ab_characters
WHERE user_id = :userId
AND char_name = :name
`;
type CharEquipment = {
    USER_ID: string
    CHAR_NAME: string
    MAIN_HAND: WeaponId
    OFF_HAND: string
    HEAD: string
    AMULET: string
    ARMOUR: string
    HANDS: string
    BELT: string
    RING1: string
    RING2: string
    POTION: string
}
async function getABEquipment(userId: string, name: string): Promise<CharEquipment|null> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<CharEquipment> = await connection.execute(getEquipmentQuery, {userId, name}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows[0];
        }
        return null;
    }
    catch (err) {
        throw new Error(`getABEquipment: ${err}`);
    }
}


export { createTableABEquipment, insertABEquipment, updateABEquipment, getABEquipment };