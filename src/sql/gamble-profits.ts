import oracledb from 'oracledb';
import { selectExecuteOptions } from './query-options';

const createTableGambleProfits = {
    name: 'GAMBLE_PROFITS',
    query: `
        CREATE TABLE gamble_profits (
            user_id VARCHAR2(255) PRIMARY KEY,
            winnings NUMBER DEFAULT 0,
            losses NUMBER DEFAULT 0
        )`
};

interface GambleProfits {
    WINNINGS: number;
    LOSSES: number;
    PROFITS: number;
}

const getUserQuery = `
SELECT winnings, losses, winnings - losses AS profits
FROM gamble_profits
WHERE user_id = :userId
`;

async function getUserGambleProfits(userId: string): Promise<GambleProfits|null> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<GambleProfits> = await connection.execute(getUserQuery, {userId}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows[0];
        }
        return null;
    }
    catch (err) {
        throw new Error(`getUserGambleProfits: ${err}`);
    }
}

const getTotalQuery = `
SELECT SUM(winnings) AS winnings, SUM(losses) AS losses, SUM(winnings) - SUM(losses) AS profits
FROM gamble_profits
`;

async function getTotalGambleProfits(): Promise<GambleProfits|null> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<GambleProfits> = await connection.execute(getTotalQuery, {}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows[0];
        }
        return null;
    }
    catch (err) {
        throw new Error(`getTotalGambleProfits: ${err}`);
    }
}

const getTopQuery = `
SELECT user_id, winnings - losses AS profits
FROM gamble_profits
ORDER BY profits DESC
`;

interface GambleProfitsUser {
    USER_ID: string;
    PROFITS: number;
}

async function getTopGambleProfits(): Promise<Array<GambleProfitsUser>> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<GambleProfitsUser> = await connection.execute(getTopQuery, {}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows;
        }
        return [];
    }
    catch (err) {
        throw new Error(`getTopGambleProfits: ${err}`);
    }
}

const updateQuery = `
MERGE INTO gamble_profits dest
    USING( SELECT :userId AS user_id, :winnings AS winnings, :losses AS losses FROM dual) src
        ON( dest.user_id = src.user_id )
    WHEN MATCHED THEN
        UPDATE SET winnings = dest.winnings + src.winnings, losses = dest.losses + src.losses
    WHEN NOT MATCHED THEN
        INSERT( user_id, winnings, losses ) 
        VALUES( src.user_id, src.winnings, src.losses )
`;

async function updateGambleProfits(userId: string, winnings: number, losses: number) {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(updateQuery, {userId, winnings, losses});
        await connection.close();
    }
    catch (err) {
        throw new Error(`updateGambleProfits: ${err}`);
    }
}

export { createTableGambleProfits, getUserGambleProfits, getTotalGambleProfits, getTopGambleProfits, updateGambleProfits };