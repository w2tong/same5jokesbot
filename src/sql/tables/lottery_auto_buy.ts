import oracledb from 'oracledb';
import { selectExecuteOptions } from '../query-options';

const createTableLotteryAutoBuy = {
    name: 'LOTTERY_AUTO_BUY',
    query: `
        CREATE TABLE lottery_auto_buy (
            user_id VARCHAR2(64) PRIMARY KEY NOT NULL
        )
    `
};

const insertQuery = `
INSERT INTO lottery_auto_buy (user_id)
VALUES (:userId)
`;

async function insertLotteryAutoBuy(userId: string) {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(insertQuery, {userId});
        await connection.close();
    }
    catch (err) {
        throw new Error(`insertLotteryAutoBuy: ${err}`);
    }
}

const deleteQuery = `
DELETE FROM lottery_auto_buy
WHERE user_id = :userId
`;
async function deleteLotteryAutoBuy(userId: string) {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(deleteQuery, {userId});
        await connection.close();
    }
    catch (err) {
        throw new Error(`insertLotteryAutoBuy: ${err}`);
    }
}

type LotteryAutoBuy = {
    USER_ID: string;
}

const getUserQuery = `
SELECT user_id
FROM lottery_auto_buy
WHERE user_id = :userId
`;
async function getUserLotteryAutoBuy(userId: string): Promise<string | null> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<LotteryAutoBuy> = await connection.execute(getUserQuery, {userId}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows[0].USER_ID;
        }
        return null;
    }
    catch (err) {
        throw new Error(`getUserLotteryAutoBuy: ${err}`);
    }
}

const getAllQuery = `
SELECT user_id
FROM lottery_auto_buy
`;
async function getAllLotteryAutoBuy(): Promise<string[]> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<LotteryAutoBuy> = await connection.execute(getAllQuery, {}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows.map(row => row.USER_ID);
        }
        return [];
    }
    catch (err) {
        throw new Error(`getAllLotteryAutoBuy: ${err}`);
    }
}


export { createTableLotteryAutoBuy, insertLotteryAutoBuy, deleteLotteryAutoBuy, getUserLotteryAutoBuy, getAllLotteryAutoBuy };