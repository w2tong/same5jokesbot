import oracledb from 'oracledb';
import { selectExecuteOptions } from '../query-options';

const createTableUserIdPairs = {
    name: 'USER_ID_PAIRS',
    query: `
        CREATE TABLE user_id_pairs (
            user_id VARCHAR2(255),
            pair_id VARCHAR2(510),
            CONSTRAINT pk_user_id_pairs PRIMARY KEY (user_id, pair_id)
        )`
};

const createTableTimeInVoiceTogether = 
{
    name: 'TIME_IN_VOICE_TOGETHER',
    query: `
        CREATE TABLE time_in_voice_together (
            pair_id VARCHAR2(510),
            guild_id VARCHAR2(255),
            start_date DATE,
            milliseconds NUMBER DEFAULT 0,
            CONSTRAINT pk_time_in_voice_together PRIMARY KEY (pair_id, guild_id, start_date)
        )`
};

const getQuery = `
SELECT b.user_id AS user_id, SUM(milliseconds) AS milliseconds
FROM user_id_pairs a
JOIN user_id_pairs b ON (a.pair_id = b.pair_id)
JOIN time_in_voice_together ON (a.pair_id = time_in_voice_together.pair_id)
WHERE :userId = a.user_id AND :userId != b.user_id
GROUP BY b.user_id
ORDER BY milliseconds DESC
`;

interface TimeInVoice {
    USER_ID: string,
    MILLISECONDS: number;
}
async function getTimeInVoiceTogether(userId: string): Promise<Array<TimeInVoice>|null> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<TimeInVoice> = await connection.execute(getQuery, {userId}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows) {
            return result.rows;
        }
        return null;
    }
    catch (err) {
        throw new Error(`getTimeInVoiceTogether: ${err}`);
    }
}

type PairInsert = {userId1: string, userId2: string}
const insertPairsQuery = `
INSERT INTO user_id_pairs( user_id, pair_id ) 
SELECT :userId, :pairId FROM dual
WHERE NOT EXISTS (SELECT NULL FROM user_id_pairs WHERE :userId = user_id AND :pairId = pair_id)
`;

async function insertUserPairs(arr: Array<PairInsert>) {
    if (arr.length === 0) return;
    try {
        const connection = await oracledb.getConnection();
        for (const {userId1, userId2} of arr) {
            const pairId = userId1 < userId2 ? userId1+userId2 : userId2+userId1;
            await connection.execute(insertPairsQuery, {userId: userId1, pairId});
            await connection.execute(insertPairsQuery, {userId: userId2, pairId});
        }
        await connection.close();
    }
    catch (err) {
        throw new Error(`insertUserPairs: ${err}`);
    }
}

const updateTimeQuery = `
MERGE INTO time_in_voice_together dest
    USING( SELECT :pairId AS pair_id, :guildId AS guild_id, TO_DATE(:startDate, 'YYYY/MM/DD') AS start_date, :time AS milliseconds FROM dual) src
        ON( dest.pair_id = src.pair_id AND dest.guild_id = src.guild_id AND dest.start_date = src.start_date )
    WHEN MATCHED THEN
        UPDATE SET milliseconds = dest.milliseconds + src.milliseconds
    WHEN NOT MATCHED THEN
        INSERT( pair_id, guild_id, start_date, milliseconds ) 
        VALUES( src.pair_id, src.guild_id, src.start_date, src.milliseconds )
`;

type TimeInVoiceTogetherUpdate = {userId1: string, userId2: string, guildId: string, startDate: string, time: number}
async function updateTimeInVoiceTogether(arr: Array<TimeInVoiceTogetherUpdate>) {
    if (arr.length === 0) return;
    try {
        const connection = await oracledb.getConnection();
        for (const {userId1, userId2, guildId, startDate, time} of arr) {
            const pairId = userId1 < userId2 ? userId1+userId2 : userId2+userId1;
            await connection.execute(updateTimeQuery, {pairId, guildId, startDate, time});
        }
        await connection.close();
    }
    catch (err) {
        throw new Error(`updateTimeInVoiceTogether: ${err}`);
    }
}

export { createTableUserIdPairs, createTableTimeInVoiceTogether, getTimeInVoiceTogether, insertUserPairs, updateTimeInVoiceTogether, PairInsert, TimeInVoiceTogetherUpdate };