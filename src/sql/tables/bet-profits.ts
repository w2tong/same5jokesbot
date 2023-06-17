import oracledb from 'oracledb';
import { selectExecuteOptions } from '../query-options';

const createTableBetProfits = {
    name: 'BET_PROFITS',
    query: `
        CREATE TABLE bet_profits (
            user_id VARCHAR2(255) PRIMARY KEY,
            winnings NUMBER DEFAULT 0,
            losses NUMBER DEFAULT 0
        )`
};

interface BetProfits {
    WINNINGS: number;
    LOSSES: number;
    PROFITS: number;
}

const getUserQuery = `
SELECT winnings, losses, winnings - losses AS profits
FROM bet_profits
WHERE user_id = :userId
`;

async function getUserBetProfits(userId: string): Promise<BetProfits|null> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<BetProfits> = await connection.execute(getUserQuery, {userId}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows[0];
        }
        return null;
    }
    catch (err) {
        throw new Error(`getUserBetProfits: ${err}`);
    }
}

const getTopQuery = `
SELECT user_id, winnings - losses AS profits
FROM bet_profits
ORDER BY profits DESC
`;

interface BetProfitsUser {
    USER_ID: string;
    PROFITS: number;
}

async function getTopBetProfits(): Promise<Array<BetProfitsUser>> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<BetProfitsUser> = await connection.execute(getTopQuery, {}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows;
        }
        return [];
    }
    catch (err) {
        throw new Error(`getTopBetProfits: ${err}`);
    }
}

const updateQuery = `
MERGE INTO bet_profits dest
    USING( SELECT :userId AS user_id, :winnings AS winnings, :losses AS losses FROM dual) src
        ON( dest.user_id = src.user_id )
    WHEN MATCHED THEN
        UPDATE SET winnings = dest.winnings + src.winnings, losses = dest.losses + src.losses
    WHEN NOT MATCHED THEN
        INSERT( user_id, winnings, losses ) 
        VALUES( src.user_id, src.winnings, src.losses )
`;

interface BetProfitsUpdate {
    userId: string;
    winnings: number;
    losses: number;
}
async function updateBetProfits(arr: Array<BetProfitsUpdate>) {
    try {
        const connection = await oracledb.getConnection();
        for (const {userId, winnings, losses} of arr) {
            await connection.execute(updateQuery, {userId, winnings, losses});
        }
        await connection.close();
    }
    catch (err) {
        throw new Error(`updateBetProfits: ${err}`);
    }
}

export { createTableBetProfits, getUserBetProfits, getTopBetProfits, updateBetProfits, BetProfitsUpdate };