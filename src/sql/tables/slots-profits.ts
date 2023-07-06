import oracledb from 'oracledb';
import { selectExecuteOptions } from '../query-options';

const createTableSlotsProfits = {
    name: 'SLOTS_PROFITS',
    query: `
        CREATE TABLE slots_profits (
            user_id VARCHAR2(64) PRIMARY KEY,
            winnings NUMBER DEFAULT 0,
            losses NUMBER DEFAULT 0
        )
    `
};

interface SlotsProfits {
    WINNINGS: number;
    LOSSES: number;
    PROFITS: number;
}

const getUserQuery = `
SELECT winnings, losses, winnings - losses AS profits
FROM slots_profits
WHERE user_id = :userId
`;

async function getUserSlotsProfits(userId: string): Promise<SlotsProfits|null> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<SlotsProfits> = await connection.execute(getUserQuery, {userId}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows[0];
        }
        return null;
    }
    catch (err) {
        throw new Error(`getUserSlotsProfits: ${err}`);
    }
}

const getTotalQuery = `
SELECT SUM(winnings) AS winnings, SUM(losses) AS losses, SUM(winnings) - SUM(losses) AS profits
FROM slots_profits
`;

async function getTotalSlotsProfits(): Promise<SlotsProfits|null> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<SlotsProfits> = await connection.execute(getTotalQuery, {}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows[0];
        }
        return null;
    }
    catch (err) {
        throw new Error(`getTotalSlotsProfits: ${err}`);
    }
}

const getTopQuery = `
SELECT user_id, winnings - losses AS profits
FROM slots_profits
ORDER BY profits DESC
`;

interface SlotsProfitsUser {
    USER_ID: string;
    PROFITS: number;
}

async function getTopSlotsProfits(): Promise<Array<SlotsProfitsUser>> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<SlotsProfitsUser> = await connection.execute(getTopQuery, {}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows;
        }
        return [];
    }
    catch (err) {
        throw new Error(`getTopSlotsProfits: ${err}`);
    }
}

const updateQuery = `
MERGE INTO slots_profits dest
    USING( SELECT :userId AS user_id, :winnings AS winnings, :losses AS losses FROM dual) src
        ON( dest.user_id = src.user_id )
    WHEN MATCHED THEN
        UPDATE SET winnings = dest.winnings + src.winnings, losses = dest.losses + src.losses
    WHEN NOT MATCHED THEN
        INSERT( user_id, winnings, losses ) 
        VALUES( src.user_id, src.winnings, src.losses )
`;

async function updateSlotsProfits(userId: string, winnings: number, losses: number) {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(updateQuery, {userId, winnings, losses});
        await connection.close();
    }
    catch (err) {
        throw new Error(`updateSlotsProfits: ${err}`);
    }
}

export { createTableSlotsProfits, getUserSlotsProfits, getTotalSlotsProfits, getTopSlotsProfits, updateSlotsProfits };