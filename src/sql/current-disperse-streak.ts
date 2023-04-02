import oracledb from 'oracledb';
import { selectExecuteOptions } from './query-options';
import { logError } from '../logger';

const createTableCurrentDisperseStreakQuery = `
CREATE TABLE current_disperse_streak (
    guild_id VARCHAR2(255) PRIMARY KEY,
    user_ids VARCHAR2(1000) NOT NULL,
    streak NUMBER DEFAULT 0
)
`;

const getQuery = `
SELECT user_ids, streak FROM current_disperse_streak
WHERE guild_id = :guildId
`;

interface DisperseCurrentStreak {
    USER_IDS: string;
    STREAK: number;
}
async function getCurrentDisperseStreak(guildId: string): Promise<DisperseCurrentStreak> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<DisperseCurrentStreak> = await connection.execute(getQuery, {guildId}, selectExecuteOptions);
        void connection.close();
        if (result && result.rows && result.rows[0]) {
            return result.rows[0];
        }
        return {USER_IDS: '', STREAK: 0};
    }
    catch (err) {
        throw new Error(`getCurrentDisperseStreak: ${err}`);
    }
}

const updateQuery = `
MERGE INTO current_disperse_streak dest
    USING( SELECT :guildId AS guild_id, :userIds AS user_ids, :streak AS streak FROM dual) src
        ON( dest.guild_id = src.guild_id )
    WHEN MATCHED THEN
            UPDATE SET user_ids = src.user_ids, streak = src.streak
    WHEN NOT MATCHED THEN
        INSERT( guild_id, user_ids, streak ) 
        VALUES( src.guild_id, src.user_ids, src.streak )
`;

async function updateCurrentDisperseStreak(guildId: string, userIds: string, streak: number) {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(updateQuery, {guildId, userIds, streak});
        void connection.close();
    }
    catch (err) {
        logError(`updateCurrentDisperseStreak: ${err}`);
    }
}


export { createTableCurrentDisperseStreakQuery, getCurrentDisperseStreak, updateCurrentDisperseStreak };