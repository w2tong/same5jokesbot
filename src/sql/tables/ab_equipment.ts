import oracledb from 'oracledb';
import { selectExecuteOptions } from '../query-options';

const createTableABEquipment = {
    name: 'AB_EQUIPMENT',
    query: `
        CREATE TABLE ab_equipment (
            user_id VARCHAR2(64) NOT NULL,
            char_name VARCHAR2(32) NOT NULL,
            main_hand INTEGER,
            off_hand INTEGER,
            head INTEGER,
            amulet INTEGER,
            armour INTEGER,
            hands INTEGER,
            belt INTEGER,
            ring1 INTEGER,
            ring2 INTEGER,
            potion INTEGER,
            CONSTRAINT fk_ab_equipment
                FOREIGN KEY (user_id, char_name)
                REFERENCES ab_characters (user_id, char_name),
            FOREIGN KEY(main_hand) REFERENCES ab_inventory(id),
            FOREIGN KEY(off_hand) REFERENCES ab_inventory(id),
            FOREIGN KEY(head) REFERENCES ab_inventory(id),
            FOREIGN KEY(amulet) REFERENCES ab_inventory(id),
            FOREIGN KEY(armour) REFERENCES ab_inventory(id),
            FOREIGN KEY(hands) REFERENCES ab_inventory(id),
            FOREIGN KEY(belt) REFERENCES ab_inventory(id),
            FOREIGN KEY(ring1) REFERENCES ab_inventory(id),
            FOREIGN KEY(ring2) REFERENCES ab_inventory(id),
            FOREIGN KEY(potion) REFERENCES ab_inventory(id)
        )
    `
};

const insertQuery = `
INSERT INTO ab_equipment (user_id, char_name)
VALUES (:userId, :name)
`;

async function insertABEquipment(userId: string, name: string): Promise<void> {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(insertQuery, {userId, name});
        await connection.close();
    }
    catch (err) {
        throw new Error(`insertABEquipment: ${err}`);
    }
}

const deleteQuery = `
DELETE FROM ab_equipment
WHERE user_id = :userId
AND char_name = :name
`;

async function deleteABEquipment(userId: string, name: string): Promise<void> {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(deleteQuery, {userId, name});
        await connection.close();
    }
    catch (err) {
        throw new Error(`deleteABEquipment: ${err}`);
    }
}

enum EquipSlot {
    MainHand = 'Main Hand',
    OffHand = 'Off Hand',
    Head = 'Head',
    Amulet = 'Amulet',
    Armour = 'Armour',
    Hands = 'Hands',
    Belt = 'Belt',
    Ring1 = 'Ring 1',
    Ring2 = 'Ring 2',
    Potion = 'Potion'
}

const updateQuery: {[key in EquipSlot]: string} = {
    [EquipSlot.MainHand]: `
    UPDATE ab_equipment SET main_hand = :id
    WHERE user_id = :userId
    AND char_name = :name
    `,
    [EquipSlot.OffHand]: `
    UPDATE ab_equipment SET off_hand = :id
    WHERE user_id = :userId
    AND char_name = :name
    `,
    [EquipSlot.Head]: `
    UPDATE ab_equipment SET head = :id
    WHERE user_id = :userId
    AND char_name = :name
    `,
    [EquipSlot.Amulet]: `
    UPDATE ab_equipment SET amulet = :id
    WHERE user_id = :userId
    AND char_name = :name
    `,
    [EquipSlot.Armour]: `
    UPDATE ab_equipment SET armour = :id
    WHERE user_id = :userId
    AND char_name = :name
    `,
    [EquipSlot.Hands]: `
    UPDATE ab_equipment SET hands = :id
    WHERE user_id = :userId
    AND char_name = :name
    `,
    [EquipSlot.Belt]: `
    UPDATE ab_equipment SET belt = :id
    WHERE user_id = :userId
    AND char_name = :name
    `,
    [EquipSlot.Ring1]: `
    UPDATE ab_equipment SET ring1 = :id
    WHERE user_id = :userId
    AND char_name = :name
    `,
    [EquipSlot.Ring2]: `
    UPDATE ab_equipment SET ring2 = :id
    WHERE user_id = :userId
    AND char_name = :name
    `,
    [EquipSlot.Potion]: `
    UPDATE ab_equipment SET potion = :id
    WHERE user_id = :userId
    AND char_name = :name
    `,
};

async function updateABEquipment(userId: string, name: string, equipSlot: EquipSlot, id: number | null) {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(updateQuery[equipSlot], {userId, name, id});
        await connection.close();
    }
    catch (err) {
        throw new Error(`updateABEquipment: ${err}`);
    }
}

const getEquipmentQuery = `
SELECT *
FROM ab_equipment
WHERE user_id = :userId
AND char_name = :name
`;
type CharEquipment = {
    USER_ID: string
    CHAR_NAME: string
    MAIN_HAND: number | null
    OFF_HAND: number | null
    HEAD: number | null
    AMULET: number | null
    ARMOUR: number | null
    HANDS: number | null
    BELT: number | null
    RING1: number | null
    RING2: number | null
    POTION: number | null
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

const getEquipmentItemIdsQuery = `
SELECT
(SELECT item_id FROM ab_inventory WHERE id = main_hand) as main_hand,
(SELECT item_id FROM ab_inventory WHERE id = off_hand) as off_hand,
(SELECT item_id FROM ab_inventory WHERE id = head) as head,
(SELECT item_id FROM ab_inventory WHERE id = amulet) as amulet,
(SELECT item_id FROM ab_inventory WHERE id = armour) as armour,
(SELECT item_id FROM ab_inventory WHERE id = hands) as hands,
(SELECT item_id FROM ab_inventory WHERE id = belt) as belt,
(SELECT item_id FROM ab_inventory WHERE id = ring1) as ring1,
(SELECT item_id FROM ab_inventory WHERE id = ring2) as ring2,
(SELECT item_id FROM ab_inventory WHERE id = potion) as potion
FROM ab_equipment
WHERE user_id = :userId
AND char_name = :name
`;

type CharEquipmentItemId = {
    MAIN_HAND: string | null
    OFF_HAND: string | null
    HEAD: string | null
    AMULET: string | null
    ARMOUR: string | null
    HANDS: string | null
    BELT: string | null
    RING1: string | null
    RING2: string | null
    POTION: string | null
}
async function getABEquipmentItemIds(userId: string, name: string): Promise<CharEquipmentItemId|null> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<CharEquipmentItemId> = await connection.execute(getEquipmentItemIdsQuery, {userId, name}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows[0];
        }
        return null;
    }
    catch (err) {
        throw new Error(`getABEquipmentItemIds: ${err}`);
    }
}

export { createTableABEquipment, EquipSlot, insertABEquipment, deleteABEquipment, updateABEquipment, getABEquipment, getABEquipmentItemIds };