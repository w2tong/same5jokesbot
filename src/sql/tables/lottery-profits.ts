import oracledb from 'oracledb';
import { selectExecuteOptions } from '../query-options';

const createTableLotteryProfits = {
    name: 'LOTTERY_PROFITS',
    query: `
        CREATE TABLE lottery_profits (
            user_id VARCHAR2(64) PRIMARY KEY,
            winnings NUMBER DEFAULT 0,
            losses NUMBER DEFAULT 0
        )
    `
};

interface LotteryProfits {
    WINNINGS: number;
    LOSSES: number;
    PROFITS: number;
}

const getUserQuery = `
SELECT winnings, losses, winnings - losses AS profits
FROM lottery_profits
WHERE user_id = :userId
`;

async function getUserLotteryProfits(userId: string): Promise<LotteryProfits|null> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<LotteryProfits> = await connection.execute(getUserQuery, {userId}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows[0];
        }
        return null;
    }
    catch (err) {
        throw new Error(`getUserLotteryProfits: ${err}`);
    }
}

const getTotalQuery = `
SELECT SUM(winnings) AS winnings, SUM(losses) AS losses, SUM(winnings) - SUM(losses) AS profits
FROM lottery_profits
`;

async function getTotalLotteryProfits(): Promise<LotteryProfits|null> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<LotteryProfits> = await connection.execute(getTotalQuery, {}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows[0];
        }
        return null;
    }
    catch (err) {
        throw new Error(`getTotalLotteryProfits: ${err}`);
    }
}

const getTopQuery = `
SELECT user_id, winnings - losses AS profits
FROM lottery_profits
ORDER BY profits DESC
`;

interface LotteryProfitsUser {
    USER_ID: string;
    PROFITS: number;
}

async function getTopLotteryProfits(): Promise<Array<LotteryProfitsUser>> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<LotteryProfitsUser> = await connection.execute(getTopQuery, {}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows;
        }
        return [];
    }
    catch (err) {
        throw new Error(`getTopLotteryProfits: ${err}`);
    }
}

const updateQuery = `
MERGE INTO lottery_profits dest
    USING( SELECT :userId AS user_id, :winnings AS winnings, :losses AS losses FROM dual) src
        ON( dest.user_id = src.user_id )
    WHEN MATCHED THEN
        UPDATE SET winnings = dest.winnings + src.winnings, losses = dest.losses + src.losses
    WHEN NOT MATCHED THEN
        INSERT( user_id, winnings, losses ) 
        VALUES( src.user_id, src.winnings, src.losses )
`;

async function updateLotteryProfits(userId: string, winnings: number, losses: number) {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(updateQuery, {userId, winnings, losses});
        await connection.close();
    }
    catch (err) {
        throw new Error(`updateLotteryProfits: ${err}`);
    }
}

export { createTableLotteryProfits, getUserLotteryProfits, getTotalLotteryProfits, getTopLotteryProfits, updateLotteryProfits };