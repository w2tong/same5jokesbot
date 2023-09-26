import oracledb from 'oracledb';
import { selectExecuteOptions } from '../query-options';
import { ItemType } from '../../autoBattler/Equipment/Item';

const createTableABInventory = {
    name: 'AB_INVENTORY',
    query: `
        CREATE TABLE ab_inventory (
            id NUMBER GENERATED ALWAYS AS IDENTITY,
            user_id VARCHAR2(64) NOT NULL,
            item_id VARCHAR2(16) NOT NULL,
            item_type VARCHAR(16) NOT NULL,
            CONSTRAINT chk_item_type CHECK (item_type IN (${Object.values(ItemType).map(type => `'${type}'`).join(',')}))
        )
    `
};

const updateTableABInventory = [`
ALTER TABLE ab_inventory
DROP CONSTRAINT chk_item_type
`,
`
ALTER TABLE ab_inventory
ADD CONSTRAINT chk_item_type CHECK (item_type IN (${Object.values(ItemType).map(type => `'${type}'`).join(',')}))
`
];

const insertQuery = `
INSERT INTO ab_inventory (user_id, item_id, item_type)
VALUES (:userId, :itemId, :itemType)
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
SELECT *
FROM ab_inventory
WHERE user_id = :userId
`;
type InventoryItem = {
    ID: number;
    USER_ID: string;
    ITEM_ID: string;
    ITEM_TYPE: ItemType;
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

export { createTableABInventory, updateTableABInventory, insertABInventoryItem, deleteABInventoryItem, getABInventory };