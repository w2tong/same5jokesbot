import oracledb from 'oracledb';
import { selectExecuteOptions } from '../query-options';

const createTableKnitCount = {
    name: 'KNIT_COUNT',
    query: `
        CREATE TABLE knit_count (
            user_id VARCHAR2(255) PRIMARY KEY,
            count NUMBER DEFAULT 0
        )`
};

const getQuery = `
SELECT count
FROM knit_count
WHERE user_id = :userId
`;

interface KnitCount {
    COUNT: number;
}
async function getKnitCount(userId: string): Promise<KnitCount|null> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<KnitCount> = await connection.execute(getQuery, {userId}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows) {
            return result.rows[0];
        }
        return null;
    }
    catch (err) {
        throw new Error(`getKnitCount: ${err}`);
    }
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
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(updateQuery, {userId});
        await connection.close();
    }
    catch (err) {
        throw new Error(`updateKnitCount: ${err}`);
    }
}

export { createTableKnitCount, getKnitCount, updateKnitCount };