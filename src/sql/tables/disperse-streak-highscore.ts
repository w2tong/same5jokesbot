import oracledb from 'oracledb';
import { selectExecuteOptions } from '../query-options';

const createTableDisperseStreakHighscore = {
    name: 'DISPERSE_STREAK_HIGHSCORE',
    query: `
        CREATE TABLE disperse_streak_highscore (
            guild_id VARCHAR2(64),
            streak_date DATE,
            user_ids VARCHAR2(1000) NOT NULL,
            streak NUMBER DEFAULT 0,
            CONSTRAINT pk_disperse_streak_highscore PRIMARY KEY (guild_id, streak_date)
        )`
};

const getQuery = `
SELECT streak_date, user_ids, streak
FROM disperse_streak_highscore
WHERE guild_id = :guildId
ORDER BY streak DESC
FETCH NEXT 1 ROWS ONLY
`;

interface DisperseStreakHighscore {
    STREAK_DATE: string;
    USER_IDS: string;
    STREAK: number;
}
async function getDisperseStreakHighscore(guildId: string): Promise<DisperseStreakHighscore|null> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<DisperseStreakHighscore> = await connection.execute(getQuery, {guildId}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows) {
            return result.rows[0];
        }
        return null;
    }
    catch (err) {
        throw new Error(`getDisperseStreakHighscore: ${err}`);
    }
}

const insertQuery = `
INSERT INTO disperse_streak_highscore ( guild_id, streak_date, user_ids, streak )
SELECT :guildId, TO_DATE(:streakDate, 'YYYY/MM/DD HH24:MI:SS'), :userIds, :streak FROM dual
WHERE :streak >= (SELECT MAX(streak) FROM disperse_streak_highscore WHERE :guildId = guild_id)
OR NOT EXISTS (SELECT * FROM  disperse_streak_highscore WHERE :guildId = guild_id)
`;

async function insertDisperseStreakHighScore(guildId: string, streakDate: string, userIds: string, streak: number): Promise<boolean> {
    try {
        const connection = await oracledb.getConnection();
        const result = await connection.execute(insertQuery, {guildId, streakDate, userIds, streak});
        await connection.close();
        if (result.rowsAffected && result.rowsAffected > 0) return true;
        return false;
    }
    catch (err) {
        throw new Error(`insertDisperseStreakHighScore: ${err}`);
    }
}

export { createTableDisperseStreakHighscore, getDisperseStreakHighscore, insertDisperseStreakHighScore };