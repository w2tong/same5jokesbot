import oracledb from 'oracledb';
import { logError } from '../logger';
import { selectExecuteOptions } from './query-options';

// GAMERS_COUNTER queries
const createTableGamersStatsQuery = `
CREATE TABLE gamers_stats (
    user_id VARCHAR2(255) PRIMARY KEY,
    discharge NUMBER DEFAULT 0,
    disperse NUMBER DEFAULT 0,
    rise_up NUMBER DEFAULT 0
)
`;

const query = `
SELECT discharge, disperse, rise_up FROM gamers_stats
WHERE user_id = :userId
`;

interface GamersCounter {
    DISCHARGE: number;
    DISPERSE: number;
    RISE_UP: number;
}
async function getGamersStats(userId: string): Promise<GamersCounter|null> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<GamersCounter> = await connection.execute(query, {userId}, selectExecuteOptions);
        void connection.close();
        if (result && result.rows) {
            return result.rows[0];
        }
        return null;
    }
    catch (err) {
        throw new Error(`getGamersStats: ${err}`);
    }
}

const updateDischargeQuery = `
MERGE INTO gamers_stats dest
    USING( SELECT :userId AS user_id FROM dual) src
        ON( dest.user_id = src.user_id )
    WHEN MATCHED THEN
        UPDATE SET discharge = dest.discharge + 1
    WHEN NOT MATCHED THEN
        INSERT( user_id, discharge ) 
        VALUES( src.user_id, 1 )
`;

const updateDisperseQuery = `
MERGE INTO gamers_stats dest
    USING( SELECT :userId AS user_id FROM dual) src
        ON( dest.user_id = src.user_id )
    WHEN MATCHED THEN
        UPDATE SET disperse = dest.disperse + 1
    WHEN NOT MATCHED THEN
        INSERT( user_id, disperse ) 
        VALUES( src.user_id, 1 )
`;

const updateRiseUpQuery = `
MERGE INTO gamers_stats dest
    USING( SELECT :userId AS user_id FROM dual) src
        ON( dest.user_id = src.user_id )
    WHEN MATCHED THEN
        UPDATE SET rise_up = dest.rise_up + 1
    WHEN NOT MATCHED THEN
        INSERT( user_id, rise_up ) 
        VALUES( src.user_id, 1 )
`;

async function updateGamersStats(userId: string, gamersWord: string) {
    let query = '';
    switch(gamersWord) {
    case 'Discharge!':
        query = updateDischargeQuery;
        break;
    case 'Disperse!':
        query = updateDisperseQuery;
        break;
    case 'Rise up!':
        query = updateRiseUpQuery;
        break;
    }
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(query, {userId});
        void connection.close();
    }
    catch (err) {
        logError(`updateGamersStats: ${err}`);
    }

}

const getTopDisperseRateQuery = `
SELECT gc.user_id, disperse/total.sum*100 AS disperse_pc, sum
FROM (SELECT user_id, discharge + disperse + rise_up AS sum FROM gamers_stats) total
JOIN gamers_stats gc
ON total.user_id = gc.user_id
ORDER BY disperse_pc DESC
`;

interface TopDisperseRate {
    USER_ID: string;
    SUM: number;
    DISPERSE_PC: number;
}
async function getTopDisperseRate(): Promise<Array<TopDisperseRate>> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<TopDisperseRate> = await connection.execute(getTopDisperseRateQuery, {}, selectExecuteOptions);
        void connection.close;
        if (result && result.rows) {
            return result.rows;
        }
        return [];
    }
    catch (err) {
        throw new Error(`getTopDisperseRate: ${err}`);
    }
}

export { createTableGamersStatsQuery, getGamersStats, updateGamersStats, getTopDisperseRate };