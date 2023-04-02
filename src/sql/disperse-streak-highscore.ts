import oracledb from 'oracledb';
import { logError } from '../logger';
import { selectExecuteOptions } from './query-options';

const createTableDisperseStreakHighscoreQuery = `
CREATE TABLE disperse_streak_highscore (
    guild_id VARCHAR2(255) PRIMARY KEY,
    user_ids VARCHAR2(255) NOT NULL,
    streak NUMBER DEFAULT 0
)
`;

const getQuery = `
SELECT user_ids, streak FROM disperse_streak_highscore
WHERE guild_id = :guildId
`;

interface DisperseStreakHighscore {
    USER_IDS: string;
    STREAK: number;
}
async function getDisperseStreakHighscore(guildId: string): Promise<DisperseStreakHighscore|null> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<DisperseStreakHighscore> = await connection.execute(getQuery, {guildId}, selectExecuteOptions);
        void connection.close();
        if (result && result.rows) {
            return result.rows[0];
        }
        return null;
    }
    catch (err) {
        throw new Error(`getDisperseStreakHighscore: ${err}`);
    }
}

const updateQuery = `
MERGE INTO disperse_streak_highscore dest
    USING( SELECT :guildId AS guild_id, :userIds AS user_ids, :streak AS streak FROM dual) src
        ON( dest.guild_id = src.guild_id )
    WHEN MATCHED THEN
            UPDATE SET user_ids = src.user_ids, streak = src.streak
            WHERE src.streak > dest.streak
    WHEN NOT MATCHED THEN
        INSERT( guild_id, user_ids, streak ) 
        VALUES( src.guild_id, src.user_ids, src.streak )
`;

async function updateDisperseStreakHighScore(guildId: string, userIds: string, streak: number) {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(updateQuery, {guildId, userIds, streak});
        void connection.close();
    }
    catch (err) {
        logError(`updateDisperseStreakHighScore: ${err}`);
    }
}

export { createTableDisperseStreakHighscoreQuery, getDisperseStreakHighscore, updateDisperseStreakHighScore };