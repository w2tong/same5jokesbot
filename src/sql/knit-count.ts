import oracledb from 'oracledb';
import logger from '../logger';
import { selectExecuteOptions } from './query-options';

// KNIT_SNEEZE queries
const createTableKnitCountQuery = `
CREATE TABLE knit_count (
    user_id VARCHAR2(255) PRIMARY KEY,
    count NUMBER DEFAULT 0
)
`;

const getQuery = `
SELECT count FROM knit_count
WHERE user_id = :userId
`;

interface KnitCount {
    COUNT: number;
}
async function getKnitCount(userId: string): Promise<KnitCount|null> {
    const connection = await oracledb.getConnection();
    const result: oracledb.Result<KnitCount> = await connection.execute(getQuery, {userId}, selectExecuteOptions);
    connection.close().catch((err: Error) => {
        logger.error({
            message: `getKnitCount ${err.message}`,
            stack: err.stack
        });
    });
    if (result && result.rows) {
        return result.rows[0];
    }
    return null;
}

const updateQuery = `
MERGE INTO knit_count dest
    USING( SELECT :userId AS user_id FROM dual) src
        ON( dest.user_id = src.user_id )
    WHEN MATCHED THEN
        UPDATE SET count = dest.count + 1
    WHEN NOT MATCHED THEN
        INSERT( user_id, count ) 
        VALUES( src.user_id, 1 )
`;

async function updateKnitCount(userId: string) {
    const connection = await oracledb.getConnection();
    await connection.execute(updateQuery, {userId});
    connection.close().catch((err: Error) => {
        logger.error({
            message: `updateKnitCount ${err.message}`,
            stack: err.stack
        });
    });
}

export { createTableKnitCountQuery, getKnitCount, updateKnitCount };