import oracledb from 'oracledb';
import { selectExecuteOptions } from '../query-options';

const createTableDeathRollProfits = {
    name: 'DEATH_ROLL_PROFITS',
    query: `
        CREATE TABLE death_roll_profits (
            user_id VARCHAR2(64) PRIMARY KEY,
            winnings NUMBER DEFAULT 0,
            losses NUMBER DEFAULT 0
        )
    `
};

interface DeathRollProfits {
    WINNINGS: number;
    LOSSES: number;
    PROFITS: number;
}

const getUserQuery = `
SELECT winnings, losses, winnings - losses AS profits
FROM death_roll_profits
WHERE user_id = :userId
`;

async function getUserDeathRollProfits(userId: string): Promise<DeathRollProfits|null> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<DeathRollProfits> = await connection.execute(getUserQuery, {userId}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows[0];
        }
        return null;
    }
    catch (err) {
        throw new Error(`getUserDeathRollProfits: ${err}`);
    }
}

const getTotalQuery = `
SELECT SUM(winnings) AS winnings, SUM(losses) AS losses, SUM(winnings) - SUM(losses) AS profits
FROM death_roll_profits
`;

async function getTotalDeathRollProfits(): Promise<DeathRollProfits|null> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<DeathRollProfits> = await connection.execute(getTotalQuery, {}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows[0];
        }
        return null;
    }
    catch (err) {
        throw new Error(`getTotalDeathRollProfits: ${err}`);
    }
}

const getTopQuery = `
SELECT user_id, winnings - losses AS profits
FROM death_roll_profits
ORDER BY profits DESC
`;

interface DeathRollProfitsUser {
    USER_ID: string;
    PROFITS: number;
}

async function getTopDeathRollProfits(): Promise<Array<DeathRollProfitsUser>> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<DeathRollProfitsUser> = await connection.execute(getTopQuery, {}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows;
        }
        return [];
    }
    catch (err) {
        throw new Error(`getTopDeathRollProfits: ${err}`);
    }
}

const updateQuery = `
MERGE INTO death_roll_profits dest
    USING( SELECT :userId AS user_id, :winnings AS winnings, :losses AS losses FROM dual) src
        ON( dest.user_id = src.user_id )
    WHEN MATCHED THEN
        UPDATE SET winnings = dest.winnings + src.winnings, losses = dest.losses + src.losses
    WHEN NOT MATCHED THEN
        INSERT( user_id, winnings, losses ) 
        VALUES( src.user_id, src.winnings, src.losses )
`;

async function updateDeathRollProfits(userId: string, winnings: number, losses: number) {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(updateQuery, {userId, winnings, losses});
        await connection.close();
    }
    catch (err) {
        throw new Error(`updateDeathRollProfits: ${err}`);
    }
}

export { createTableDeathRollProfits, getUserDeathRollProfits, getTotalDeathRollProfits, getTopDeathRollProfits, updateDeathRollProfits };