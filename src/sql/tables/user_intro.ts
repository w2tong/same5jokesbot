import oracledb from 'oracledb';
import { selectExecuteOptions } from '../query-options';

const createTableUserIntro = {
    name: 'USER_INTRO',
    query: `
        CREATE TABLE user_intro (
            user_id VARCHAR2(64) PRIMARY KEY,
            audio VARCHAR2(64)
        )
    `
};

interface UserIntro {
    AUDIO: string;
}

const getUserQuery = `
SELECT audio
FROM user_intro
WHERE user_id = :userId
`;

async function getUserIntro(userId: string): Promise<string|null> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<UserIntro> = await connection.execute(getUserQuery, {userId}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows[0].AUDIO;
        }
        return null;
    }
    catch (err) {
        throw new Error(`getUserIntro: ${err}`);
    }
}

const updateQuery = `
MERGE INTO user_intro dest
    USING( SELECT :userId AS user_id, :audio AS audio FROM dual) src
        ON( dest.user_id = src.user_id )
    WHEN MATCHED THEN
        UPDATE SET audio = src.audio
    WHEN NOT MATCHED THEN
        INSERT( user_id, audio ) 
        VALUES( src.user_id, src.audio )
`;

async function updateUserIntro(userId: string, audio: string|null) {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(updateQuery, {userId, audio});
        await connection.close();
    }
    catch (err) {
        throw new Error(`updateDailyCoins: ${err}`);
    }
}

export { createTableUserIntro, getUserIntro, updateUserIntro };