import oracledb from 'oracledb';
import logger from '../logger';
import { selectExecuteOptions } from './query-options';

const createTableSneezeCountQuery = `
CREATE TABLE sneeze_count (
    user_id VARCHAR2(255) PRIMARY KEY,
    count NUMBER DEFAULT 0
)
`;

const getQuery = `
SELECT count FROM sneeze_count
WHERE user_id = :userId
`;

interface SneezeCount {
    COUNT: number;
}
async function getSneezeCount(userId: string): Promise<SneezeCount|null> {
    const connection = await oracledb.getConnection();
    const result: oracledb.Result<SneezeCount> = await connection.execute(getQuery, {userId}, selectExecuteOptions);
    connection.close().catch((err: Error) => {
        logger.error({
            message: `getSneezeCount ${err.message}`,
            stack: err.stack
        });
    });
    if (result && result.rows) {
        return result.rows[0];
    }
    return null;
}

const updateQuery = `
MERGE INTO sneeze_count dest
    USING( SELECT :userId AS user_id FROM dual) src
        ON( dest.user_id = src.user_id )
    WHEN MATCHED THEN
        UPDATE SET count = dest.count + 1
    WHEN NOT MATCHED THEN
        INSERT( user_id, count ) 
        VALUES( src.user_id, 1 )
`;

async function updateSneezeCount(userId: string) {
    const connection = await oracledb.getConnection();
    await connection.execute(updateQuery, {userId});
    connection.close().catch((err: Error) => {
        logger.error({
            message: `updateKnitCount ${err.message}`,
            stack: err.stack
        });
    });
}

export { createTableSneezeCountQuery, getSneezeCount, updateSneezeCount };