import oracledb from 'oracledb';
import { logError } from '../logger';
import { selectExecuteOptions } from './query-options';

const createTableAudioCount = `
CREATE TABLE audio_count (
    user_id VARCHAR2(255),
    audio VARCHAR2(255),
    month_year DATE,
    count NUMBER DEFAULT 0,
    CONSTRAINT pk_audio_count PRIMARY KEY (user_id, audio, month_year)
)
`;

const getQuery = `
SELECT audio, SUM(count) AS count FROM audio_count
WHERE user_id = :userId
GROUP BY audio
ORDER BY count DESC
`;

interface AudioCount {
    AUDIO: string;
    COUNT: number;
}
async function getAudioCountTotal(userId: string): Promise<Array<AudioCount>|null> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<AudioCount> = await connection.execute(getQuery, {userId}, selectExecuteOptions);
        void connection.close();
        if (result && result.rows) {
            return result.rows;
        }
        return null;
    }
    catch (err) {
        throw new Error(`getAudioCountTotal: ${err}`);
    }
}

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

export { createTableAudioCount, getAudioCountTotal, updateAudioCount };