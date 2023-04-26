import oracledb from 'oracledb';
import { logError } from '../logger';

const createTableAudioCount = `
CREATE TABLE audio_count (
    user_id VARCHAR2(255),
    audio VARCHAR2(255),
    month_year DATE,
    count NUMBER DEFAULT 0,
    CONSTRAINT pk_audio_count PRIMARY KEY (user_id, audio, month_year)
)
`;

const updateQuery = `
MERGE INTO audio_count dest
    USING( SELECT :userId AS user_id, :audio AS audio, TRUNC(SYSDATE, 'MONTH') AS month_year FROM dual) src
        ON( dest.user_id = src.user_id AND dest.audio = src.audio AND dest.month_year = src.month_year )
    WHEN MATCHED THEN
        UPDATE SET count = dest.count + 1
    WHEN NOT MATCHED THEN
        INSERT( user_id, audio, month_year, count ) 
        VALUES( src.user_id, src.audio, src.month_year, 1 )
`;

async function updateAudioCount(userId: string, audio: string) {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(updateQuery, {userId, audio});
        void connection.close();
    }
    catch (err) {
        logError(`updateAudioCount: ${err}`);
    }
}

export { createTableAudioCount, updateAudioCount };