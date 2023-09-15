import oracledb from 'oracledb';
import { selectExecuteOptions } from '../query-options';

const createTableDailyCoins = {
    name: 'DAILY_COINS',
    query: `
        CREATE TABLE daily_coins (
            user_id VARCHAR2(64) PRIMARY KEY,
            coins NUMBER DEFAULT 0
        )
    `
};

interface DailyCoins {
    COINS: number;
}

const getUserQuery = `
SELECT coins
FROM daily_coins
WHERE user_id = :userId
`;

async function getDailyCoins(userId: string): Promise<number|null> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<DailyCoins> = await connection.execute(getUserQuery, {userId}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows[0].COINS;
        }
        return null;
    }
    catch (err) {
        throw new Error(`getDailyCoins: ${err}`);
    }
}

const updateQuery = `
MERGE INTO daily_coins dest
    USING( SELECT :userId AS user_id, :coins AS coins FROM dual) src
        ON( dest.user_id = src.user_id )
    WHEN MATCHED THEN
        UPDATE SET coins = dest.coins + src.coins
    WHEN NOT MATCHED THEN
        INSERT( user_id, coins ) 
        VALUES( src.user_id, src.coins )
`;

async function updateDailyCoins(userId: string, coins: number) {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(updateQuery, {userId, coins});
        await connection.close();
    }
    catch (err) {
        throw new Error(`updateDailyCoins: ${err}`);
    }
}

export { createTableDailyCoins, getDailyCoins, updateDailyCoins };