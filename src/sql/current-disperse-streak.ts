import oracledb from 'oracledb';
import { selectExecuteOptions } from './query-options';

const createTableCurrentDisperseStreak = {
    name: 'CURRENT_DISPERSE_STREAK',
    query: `
        CREATE TABLE current_disperse_streak (
            guild_id VARCHAR2(255) PRIMARY KEY,
            streak_date DATE,
            user_ids VARCHAR2(1000) NOT NULL,
            streak NUMBER DEFAULT 0
        )`
};

const getQuery = `
SELECT streak_date, user_ids, streak FROM current_disperse_streak
WHERE guild_id = :guildId
`;

interface CurrentDisperseStreak {
    STREAK_DATE: string;
    USER_IDS: string;
    STREAK: number;
}
async function getCurrentDisperseStreak(guildId: string): Promise<CurrentDisperseStreak> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<CurrentDisperseStreak> = await connection.execute(getQuery, {guildId}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows[0]) {
            return result.rows[0];
        }
        return {STREAK_DATE: '', USER_IDS: '', STREAK: 0};
    }
    catch (err) {
        throw new Error(`getCurrentDisperseStreak: ${err}`);
    }
}

const updateQuery = `
MERGE INTO current_disperse_streak dest
    USING( SELECT :guildId AS guild_id, TO_DATE(:streakDate, 'YYYY/MM/DD HH24:MI:SS') AS streak_date, :userIds AS user_ids, :streak AS streak FROM dual) src
        ON( dest.guild_id = src.guild_id )
    WHEN MATCHED THEN
            UPDATE SET user_ids = src.user_ids, streak = src.streak, streak_date = src.streak_date
    WHEN NOT MATCHED THEN
        INSERT( guild_id, streak_date, user_ids, streak ) 
        VALUES( src.guild_id, src.streak_date, src.user_ids, src.streak )
`;

async function updateCurrentDisperseStreak(guildId: string, streakDate: string, userIds: string, streak: number) {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(updateQuery, {guildId, streakDate, userIds, streak});
        await connection.close();
    }
    catch (err) {
        throw new Error(`updateCurrentDisperseStreak: ${err}`);
    }
}


export { createTableCurrentDisperseStreak, getCurrentDisperseStreak, updateCurrentDisperseStreak, CurrentDisperseStreak };