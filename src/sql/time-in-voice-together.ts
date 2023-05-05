import oracledb from 'oracledb';
import { selectExecuteOptions } from './query-options';
import { logError } from '../logger';

const createTableUserIdPairsQuery = `
CREATE TABLE user_id_pairs (
    user_id VARCHAR2(255),
    pair_id VARCHAR2(510),
    CONSTRAINT pk_user_id_pairs PRIMARY KEY (user_id, pair_id)
)
`;

const createTableTimeInVoiceTogetherQuery = `
CREATE TABLE time_in_voice_together (
    pair_id VARCHAR2(510),
    guild_id VARCHAR2(255),
    start_date DATE,
    milliseconds NUMBER DEFAULT 0,
    CONSTRAINT pk_time_in_voice_together PRIMARY KEY (pair_id, guild_id, start_date)
)
`;

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
        void connection.close();
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
VALUES( :userId, :pairId )
`;

async function insertUserPairs(pairInserts: Array<PairInsert>) {
    
    try {
        const connection = await oracledb.getConnection();
        const queries = [];
        for (const {userId1, userId2} of pairInserts) {
            const pairId = userId1 < userId2 ? userId1+userId2 : userId2+userId1;
            queries.push(connection.execute(insertPairsQuery, {userId: userId1, pairId}));
            queries.push(connection.execute(insertPairsQuery, {userId: userId2, pairId}));
        }
        await Promise.all(queries);
        void connection.close();
    }
    catch (err) {
        //logError(`insertUserPairs: ${err}`);
    }
}

const updateTimeQuery = `
MERGE INTO time_in_voice_together dest
    USING( SELECT :pairId AS pair_id, :guildId AS guild_id, TO_DATE(:startDate, 'yyyy/mm/dd') AS start_date, :time AS milliseconds FROM dual) src
        ON( dest.pair_id = src.pair_id AND dest.guild_id = src.guild_id AND dest.start_date = src.start_date )
    WHEN MATCHED THEN
        UPDATE SET milliseconds = dest.milliseconds + src.milliseconds
    WHEN NOT MATCHED THEN
        INSERT( pair_id, guild_id, start_date, milliseconds ) 
        VALUES( src.pair_id, src.guild_id, src.start_date, src.milliseconds )
`;

type TimeInVoiceTogetherUpdate = {userId1: string, userId2: string, guildId: string, startDate: string, time: number}
async function updateTimeInVoiceTogether(arr: Array<TimeInVoiceTogetherUpdate>) {
    try {
        const connection = await oracledb.getConnection();
        const queries = [];
        for (const {userId1, userId2, guildId, startDate, time} of arr) {
            const pairId = userId1 < userId2 ? userId1+userId2 : userId2+userId1;
            queries.push(connection.execute(updateTimeQuery, {pairId, guildId, startDate, time}));
        }
        await Promise.all(queries);
        void connection.close();
    }
    catch (err) {
        logError(`updateTimeInVoiceTogether: ${err}`);
    }
}

export { createTableUserIdPairsQuery, createTableTimeInVoiceTogetherQuery, getTimeInVoiceTogether, insertUserPairs, updateTimeInVoiceTogether, PairInsert, TimeInVoiceTogetherUpdate };