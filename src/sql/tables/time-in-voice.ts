import oracledb from 'oracledb';
import { selectExecuteOptions } from '../query-options';

const createTableTimeInVoice = {
    name: 'TIME_IN_VOICE',
    query: `
        CREATE TABLE time_in_voice (
            user_id VARCHAR2(255),
            guild_id VARCHAR2(255),
            start_date DATE,
            milliseconds NUMBER DEFAULT 0,
            CONSTRAINT pk_time_in_voice PRIMARY KEY (user_id, guild_id, start_date)
        )`
};

const getTodayQuery = `
SELECT milliseconds
FROM time_in_voice
WHERE user_id = :userId AND guild_id = :guildId
AND start_date = TRUNC(SYSDATE)
`;
const getMonthQuery = `
SELECT SUM(milliseconds) AS milliseconds
FROM time_in_voice
WHERE user_id = :userId AND guild_id = :guildId
AND TRUNC(start_date, 'MONTH') = TRUNC(SYSDATE, 'MONTH')
`;
const getYearQuery = `
SELECT SUM(milliseconds) AS milliseconds
FROM time_in_voice
WHERE user_id = :userId AND guild_id = :guildId
AND TRUNC(start_date, 'YEAR') = TRUNC(SYSDATE, 'YEAR')
`;
const getTotalQuery = `
SELECT SUM(milliseconds) AS milliseconds
FROM time_in_voice
WHERE user_id = :userId AND guild_id = :guildId
`;

interface TimeInVoice {
    MILLISECONDS: number;
}
async function getTimeInVoice(userId: string, guildId: string, dateRange?: string): Promise<TimeInVoice|null> {
    try {
        let query = getTotalQuery; 
        switch(dateRange) {
        case 'today':
            query = getTodayQuery;
            break;
        case 'month':
            query = getMonthQuery;
            break;
        case 'year':
            query = getYearQuery;
            break;
        }

        const connection = await oracledb.getConnection();
        const result: oracledb.Result<TimeInVoice> = await connection.execute(query, {userId, guildId}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows) {
            return result.rows[0];
        }
        return null;
    }
    catch (err) {
        throw new Error(`getTimeInVoice: ${err}`);
    }
}

interface TimeInVoiceByDate {
    START_DATE: string;
    MILLISECONDS: number;
}
const getUserLast30DaysQuery = `
SELECT start_date, milliseconds
FROM time_in_voice
WHERE user_id = :userId AND guild_id = :guildId
AND start_date > SYSDATE-30
ORDER BY start_date ASC
`;

async function getUserLast30DaysTimeInVoice(userId: string, guildId: string): Promise<Array<TimeInVoiceByDate>|null> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<TimeInVoiceByDate> = await connection.execute(getUserLast30DaysQuery, {userId, guildId}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows;
        }
        return null;
    }
    catch (err) {
        throw new Error(`getLast30DaysQuery: ${err}`);
    }
}

interface TimeInVoiceByUser {
    USER_ID: string;
    MILLISECONDS: number;
}
const getGuildLast30DaysQuery = `
SELECT user_id, SUM(milliseconds) AS milliseconds
FROM time_in_voice
WHERE guild_id = :guildId
AND start_date > SYSDATE-30
GROUP BY user_id
ORDER BY milliseconds DESC
`;

async function getGuildLast30DaysTimeInVoice(guildId: string): Promise<Array<TimeInVoiceByUser>|null> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<TimeInVoiceByUser> = await connection.execute(getGuildLast30DaysQuery, {guildId}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows;
        }
        return null;
    }
    catch (err) {
        throw new Error(`getLast30DaysQuery: ${err}`);
    }
}

const updateQuery = `
MERGE INTO time_in_voice dest
    USING( SELECT :userId AS user_id, :guildId AS guild_id, TO_DATE(:startDate, 'YYYY/MM/DD') AS start_date, :time AS milliseconds FROM dual) src
        ON( dest.user_id = src.user_id AND dest.guild_id = src.guild_id AND dest.start_date = src.start_date )
    WHEN MATCHED THEN
        UPDATE SET milliseconds = dest.milliseconds + src.milliseconds
    WHEN NOT MATCHED THEN
        INSERT( user_id, guild_id, start_date, milliseconds ) 
        VALUES( src.user_id, src.guild_id, src.start_date, src.milliseconds )
`;

type TimeInVoiceUpdate = {userId: string, guildId: string, startDate:string, time: number}
async function updateTimeInVoice(arr: Array<TimeInVoiceUpdate>) {
    if (arr.length === 0) return;
    try {
        const connection = await oracledb.getConnection();
        for (const {userId, guildId, startDate, time} of arr) {
            await connection.execute(updateQuery, {userId, guildId, startDate, time});
        }
        await connection.close();
    }
    catch (err) {
        throw new Error(`updateTimeInVoice: ${err}`);
    }
}

export { createTableTimeInVoice, getTimeInVoice, getUserLast30DaysTimeInVoice, getGuildLast30DaysTimeInVoice, updateTimeInVoice, TimeInVoiceUpdate };