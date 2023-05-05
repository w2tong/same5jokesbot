import oracledb from 'oracledb';
import { logError } from '../logger';
import { selectExecuteOptions } from './query-options';

// GAMERS_COUNTER queries
const createTableGamersStatsQuery = `
CREATE TABLE gamers_stats (
    user_id VARCHAR2(255) NOT NULL,
    month_year DATE NOT NULL,
    discharge NUMBER DEFAULT 0,
    disperse NUMBER DEFAULT 0,
    rise_up NUMBER DEFAULT 0,
    CONSTRAINT pk_gamers_stats PRIMARY KEY (user_id, month_year)
)
`;

interface GamersCounter {
    DISCHARGE: number;
    DISPERSE: number;
    RISE_UP: number;
}

const monthYearQuery = `
SELECT discharge, disperse, rise_up FROM gamers_stats
WHERE user_id = :userId
AND month_year = TO_DATE(:monthYear, 'yyyy/mm')
`;

async function getGamersStatsMonthYear(userId: string, month: string, year: string): Promise<GamersCounter|null> {
    try {
        const monthYear = `${year}/${month}`;
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<GamersCounter> = await connection.execute(monthYearQuery, {userId, monthYear}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows) {
            return result.rows[0];
        }
        return null;
    }
    catch (err) {
        throw new Error(`getGamersStats: ${err}`);
    }
}

const yearQuery = `
SELECT SUM(discharge) AS discharge, SUM(disperse) AS disperse, SUM(rise_up) AS rise_up FROM gamers_stats
WHERE user_id = :userId
AND EXTRACT(YEAR FROM month_year) = :year
`;

async function getGamersStatsYear(userId: string, year: string): Promise<GamersCounter|null> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<GamersCounter> = await connection.execute(yearQuery, {userId, year}, selectExecuteOptions);
        await connection.close();
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
    USING( SELECT :userId AS user_id, TRUNC(SYSDATE, 'MONTH') AS month_year FROM dual) src
        ON( dest.user_id = src.user_id AND dest.month_year = src.month_year )
    WHEN MATCHED THEN
        UPDATE SET discharge = dest.discharge + 1
    WHEN NOT MATCHED THEN
        INSERT( user_id, month_year, discharge )
        VALUES( src.user_id, src.month_year, 1 )
`;

const updateDisperseQuery = `
MERGE INTO gamers_stats dest
    USING( SELECT :userId AS user_id, TRUNC(SYSDATE, 'MONTH') AS month_year FROM dual) src
        ON( dest.user_id = src.user_id AND dest.month_year = src.month_year )
    WHEN MATCHED THEN
        UPDATE SET disperse = dest.disperse + 1
    WHEN NOT MATCHED THEN
        INSERT( user_id, month_year, disperse ) 
        VALUES( src.user_id, src.month_year, 1 )
`;

const updateRiseUpQuery = `
MERGE INTO gamers_stats dest
    USING( SELECT :userId AS user_id, TRUNC(SYSDATE, 'MONTH') AS month_year FROM dual) src
        ON( dest.user_id = src.user_id AND dest.month_year = src.month_year )
    WHEN MATCHED THEN
        UPDATE SET rise_up = dest.rise_up + 1
    WHEN NOT MATCHED THEN
        INSERT( user_id, month_year, rise_up ) 
        VALUES( src.user_id, src.month_year, 1 )
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
        await connection.close();
    }
    catch (err) {
        logError(`updateGamersStats: ${err}`);
    }

}

const getTopDisperseRateQuery = `
SELECT gc.user_id, disperse/total.sum*100 AS disperse_pc, sum
FROM (
    SELECT user_id, month_year, discharge + disperse + rise_up AS sum FROM gamers_stats
    WHERE month_year = TO_DATE(:monthYear, 'yyyy/mm')
    ) total
JOIN gamers_stats gc
ON total.user_id = gc.user_id AND total.month_year = gc.month_year
ORDER BY disperse_pc DESC
`;

interface TopDisperseRate {
    USER_ID: string;
    SUM: number;
    DISPERSE_PC: number;
}
async function getTopDisperseRate(month: string, year: string): Promise<Array<TopDisperseRate>> {
    try {
        const monthYear = `${year}/${month}`;
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<TopDisperseRate> = await connection.execute(getTopDisperseRateQuery, {monthYear}, selectExecuteOptions);
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

export { createTableGamersStatsQuery, getGamersStatsMonthYear, getGamersStatsYear, updateGamersStats, getTopDisperseRate };