import oracledb from 'oracledb';
import { selectExecuteOptions } from '../query-options';

const createTableABInventory = {
    name: 'AB_INVENTORY',
    query: `
        CREATE TABLE ab_inventory (
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
DELETE FROM ab_characters
WHERE user_id = :userId
AND item_id = :itemId
`;

async function deleteABInventoryItem(userId: string, itemId: string) {
    try {
        const connection = await oracledb.getConnection();
        const res = await connection.execute(deleteQuery, {userId, itemId});
        await connection.close();
        return res;
    }
    catch (err) {
        throw new Error(`deleteABInventoryItem: ${err}`);
    }
}

const getQuery = `
SELECT *
FROM ab_inventory
WHERE user_id = :userId
`;
type InventoryItem = {
    USER_ID: string;
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

export { createTableABInventory, insertABInventoryItem, deleteABInventoryItem, getABInventory };