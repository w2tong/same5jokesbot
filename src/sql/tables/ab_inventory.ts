import oracledb from 'oracledb';
import { selectExecuteOptions } from '../query-options';

const createTableABInventory = {
    name: 'AB_INVENTORY',
    query: `
        CREATE TABLE ab_inventory ( 
            id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            user_id VARCHAR2(64) NOT NULL,
            item_id VARCHAR2(16) NOT NULL
        )
    `
};

const insertQuery = `
INSERT INTO ab_inventory (user_id, item_id)
VALUES (:userId, :itemId)
`;

async function insertABInventoryItem(userId: string, itemId: string): Promise<boolean> {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(insertQuery, {userId, itemId});
        await connection.close();
        return true;
    }
    catch (err) {
        throw new Error(`insertABInventoryItem: ${err}`);
    }
}

const deleteQuery = `
DELETE FROM ab_inventory
WHERE user_id = :userId
AND id = :id
`;

async function deleteABInventoryItem(userId: string, id: string) {
    try {
        const connection = await oracledb.getConnection();
        const res = await connection.execute(deleteQuery, {userId, id});
        await connection.close();
        return res;
    }
    catch (err) {
        throw new Error(`deleteABInventoryItem: ${err}`);
    }
}

const getQuery = `
SELECT id, item_id
FROM ab_inventory
WHERE user_id = :userId
AND id NOT IN (SELECT main_hand FROM ab_equipment WHERE user_id = :userId AND main_hand IS NOT NULL)
AND id NOT IN (SELECT off_hand FROM ab_equipment WHERE user_id = :userId AND off_hand IS NOT NULL)
AND id NOT IN (SELECT head FROM ab_equipment WHERE user_id = :userId AND head IS NOT NULL)
AND id NOT IN (SELECT amulet FROM ab_equipment WHERE user_id = :userId AND amulet IS NOT NULL)
AND id NOT IN (SELECT armour FROM ab_equipment WHERE user_id = :userId AND armour IS NOT NULL)
AND id NOT IN (SELECT hands FROM ab_equipment WHERE user_id = :userId AND hands IS NOT NULL)
AND id NOT IN (SELECT belt FROM ab_equipment WHERE user_id = :userId AND belt IS NOT NULL)
AND id NOT IN (SELECT ring1 FROM ab_equipment WHERE user_id = :userId AND ring1 IS NOT NULL)
AND id NOT IN (SELECT ring2 FROM ab_equipment WHERE user_id = :userId AND ring2 IS NOT NULL)
AND id NOT IN (SELECT potion FROM ab_equipment WHERE user_id = :userId AND potion IS NOT NULL)
`;
type InventoryItem = {
    ID: number;
    ITEM_ID: string;
}

async function getABInventory(userId: string): Promise<InventoryItem[]> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<InventoryItem> = await connection.execute(getQuery, {userId}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows;
        }
        return [];
    }
    catch (err) {
        throw new Error(`getABInventory: ${err}`);
    }
}

const getCharQuery = `
SELECT id, item_id
FROM ab_inventory
WHERE user_id = :userId
AND id NOT IN (SELECT main_hand FROM ab_equipment WHERE user_id = :userId AND char_name != :name AND main_hand IS NOT NULL)
AND id NOT IN (SELECT off_hand FROM ab_equipment WHERE user_id = :userId AND char_name != :name AND off_hand IS NOT NULL)
AND id NOT IN (SELECT head FROM ab_equipment WHERE user_id = :userId AND char_name != :name AND head IS NOT NULL)
AND id NOT IN (SELECT amulet FROM ab_equipment WHERE user_id = :userId AND char_name != :name AND amulet IS NOT NULL)
AND id NOT IN (SELECT armour FROM ab_equipment WHERE user_id = :userId AND char_name != :name AND armour IS NOT NULL)
AND id NOT IN (SELECT hands FROM ab_equipment WHERE user_id = :userId AND char_name != :name AND hands IS NOT NULL)
AND id NOT IN (SELECT belt FROM ab_equipment WHERE user_id = :userId AND char_name != :name AND belt IS NOT NULL)
AND id NOT IN (SELECT ring1 FROM ab_equipment WHERE user_id = :userId AND char_name != :name AND ring1 IS NOT NULL)
AND id NOT IN (SELECT ring2 FROM ab_equipment WHERE user_id = :userId AND char_name != :name AND ring2 IS NOT NULL)
AND id NOT IN (SELECT potion FROM ab_equipment WHERE user_id = :userId AND char_name != :name AND potion IS NOT NULL)
`;

async function getABCharInventory(userId: string, name: string): Promise<InventoryItem[]> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<InventoryItem> = await connection.execute(getCharQuery, {userId, name}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows;
        }
        return [];
    }
    catch (err) {
        throw new Error(`getABCharInventory: ${err}`);
    }
}

export { createTableABInventory, insertABInventoryItem, deleteABInventoryItem, getABInventory, getABCharInventory };