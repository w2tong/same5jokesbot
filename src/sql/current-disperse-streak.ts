import oracledb from 'oracledb';
import logger from '../logger';
import { selectExecuteOptions } from './query-options';

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
    const connection = await oracledb.getConnection();
    const result: oracledb.Result<DisperseCurrentStreak> = await connection.execute(getQuery, {guildId}, selectExecuteOptions);
    connection.close().catch((err: Error) => {
        logger.error({
            message: `getCurrentDisperseStreak ${err.message}`,
            stack: err.stack
        });
    });
    if (result && result.rows && result.rows[0]) {
        return result.rows[0];
    }
    return {USER_IDS: '', STREAK: 0};
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
    const connection = await oracledb.getConnection();
    await connection.execute(updateQuery, {guildId, userIds, streak});
    connection.close().catch((err: Error) => {
        logger.error({
            message: `updateCurrentDisperseStreak ${err.message}`,
            stack: err.stack
        });
    });
}


export { createTableCurrentDisperseStreakQuery, getCurrentDisperseStreak, updateCurrentDisperseStreak };