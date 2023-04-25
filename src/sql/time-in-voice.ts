import oracledb from 'oracledb';
import { selectExecuteOptions } from './query-options';
import { logError } from '../logger';

const createTableTimeInVoiceQuery = `
CREATE TABLE time_in_voice (
    user_id VARCHAR2(255),
    guild_id VARCHAR2(255),
    milliseconds NUMBER DEFAULT 0,
    CONSTRAINT pk_userguild_id PRIMARY KEY (user_id, guild_id)
)
`;

const getQuery = `
SELECT milliseconds FROM time_in_voice
WHERE user_id = :userId AND guild_id = :guildId
`;
interface TimeInVoice {
    MILLISECONDS: number;
}
async function getTimeInVoice(userId: string, guildId: string): Promise<TimeInVoice|null> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<TimeInVoice> = await connection.execute(getQuery, {userId, guildId}, selectExecuteOptions);
        void connection.close();
        if (result && result.rows) {
            return result.rows[0];
        }
        return null;
    }
    catch (err) {
        throw new Error(`getTimeInVoice: ${err}`);
    }
}

const updateQuery = `
MERGE INTO time_in_voice dest
    USING( SELECT :userId AS user_id, :guildId AS guild_id, :time AS milliseconds FROM dual) src
        ON( dest.user_id = src.user_id AND dest.guild_id = src.guild_id)
    WHEN MATCHED THEN
        UPDATE SET milliseconds = dest.milliseconds + src.milliseconds
    WHEN NOT MATCHED THEN
        INSERT( user_id, guild_id, milliseconds ) 
        VALUES( src.user_id, src.guild_id, src.milliseconds )
`;

async function updateTimeInVoice(userId: string, guildId: string, time: number) {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(updateQuery, {userId, guildId, time});
        void connection.close();
    }
    catch (err) {
        logError(`updateTimeInVoice: ${err}`);
    }
}

export { createTableTimeInVoiceQuery, getTimeInVoice, updateTimeInVoice };