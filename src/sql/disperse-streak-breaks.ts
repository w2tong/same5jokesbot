import oracledb from 'oracledb';
import { selectExecuteOptions } from './query-options';

const createTableDisperseStreakBreaks = {
    name: 'DISPERSE_STREAK_BREAKS',
    query: `
        CREATE TABLE disperse_streak_breaks (
            user_id VARCHAR2(255) PRIMARY KEY,
            breaks NUMBER DEFAULT 0,
            score NUMBER DEFAULT 0
        )`
};

const getQuery = `
SELECT breaks, score FROM disperse_streak_breaks
WHERE user_id = :userId
`;

interface DisperseStreakBreaks{
    BREAKS: number;
    SCORE: number;
}
async function getDisperseStreakBreaks(userId: string): Promise<DisperseStreakBreaks|null> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<DisperseStreakBreaks> = await connection.execute(getQuery, {userId}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows[0]) {
            return result.rows[0];
        }
        return null;
    }
    catch (err) {
        throw new Error(`getDisperseStreakBreaks: ${err}`);
    }
}

const updateQuery = `
MERGE INTO disperse_streak_breaks dest
    USING( SELECT :userId AS user_id, :score AS score FROM dual) src
        ON( dest.user_id = src.user_id )
    WHEN MATCHED THEN
        UPDATE SET breaks = dest.breaks + 1, score = dest.score + src.score
    WHEN NOT MATCHED THEN
        INSERT( user_id, breaks, score ) 
        VALUES( src.user_id, 1, src.score )
`;

async function updateDisperseStreakBreaks(userId: string, score: number) {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(updateQuery, {userId, score});
        await connection.close();
    }
    catch (err) {
        throw new Error(`updateDisperseStreakBreaks: ${err}`);
    }
    
}

const getTopDisperseStreakBreaksQuery =`
SELECT * FROM disperse_streak_breaks
ORDER BY score DESC
`;

interface TopDisperseStreakBreaks {
    USER_ID: string;
    BREAKS: number;
    SCORE: number;
}
async function getTopDisperseStreakBreaks(): Promise<Array<TopDisperseStreakBreaks>> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<TopDisperseStreakBreaks> = await connection.execute(getTopDisperseStreakBreaksQuery, {}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows) {
            return result.rows;
        }
        return [];
    }
    catch (err) {
        throw new Error(`getTopDisperseStreakBreaks: ${err}`);
    }
}

export { createTableDisperseStreakBreaks, getDisperseStreakBreaks, updateDisperseStreakBreaks, getTopDisperseStreakBreaks };