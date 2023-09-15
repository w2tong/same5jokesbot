import oracledb from 'oracledb';
import { selectExecuteOptions } from '../query-options';

const tableName = 'DAILY_PROGRESS';
const createTableDailyProgress = {
    name: tableName,
    query: `
        CREATE TABLE daily_progress (
            user_id VARCHAR2(64) NOT NULL,
            daily_id VARCHAR2(64) NOT NULL,
            progress NUMBER DEFAULT 0 NOT NULL,
            completed NUMBER(1) DEFAULT 0 NOT NULL,
            CONSTRAINT pk_daily_progress PRIMARY KEY (user_id, daily_id)
        )
    `
};

const insertQuery = `
INSERT INTO ${tableName} ( user_id, daily_id ) 
VALUES( :userId, :dailyId )
`;
const insertBindDefs = {
    userId: {type: oracledb.STRING, maxSize: 64},
    dailyId: {type: oracledb.STRING, maxSize: 64}
};

async function insertDailyProgress(arr: Array<{userId: string, dailyId: string}>) {
    try {
        const connection = await oracledb.getConnection();
        await connection.executeMany(insertQuery, arr, {bindDefs: insertBindDefs});
        await connection.close();
    }
    catch (err) {
        throw new Error(`insertDailyProgress: ${err}`);
    }
}

const updateQuery = `
UPDATE ${tableName}
SET progress = :progress, completed = :completed
WHERE user_id = :userId AND daily_id = :dailyId
`;

async function updateDailyProgress(userId: string, dailyId: string, progress: number, completed: boolean) {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(updateQuery, {userId, dailyId, progress, completed: completed ? 1 : 0});
        await connection.close();
    }
    catch (err) {
        throw new Error(`updateDailyProgress: ${err}`);
    }
}

const truncateQuery = `
TRUNCATE TABLE ${tableName}
`;

async function truncateDailyProgress() {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(truncateQuery);
        await connection.close();
    }
    catch (err) {
        throw new Error(`truncateDailyProgress: ${err}`);
    }
}

type DailyProgress = {
    USER_ID: string;
    DAILY_ID: string;
    PROGRESS: number;
    COMPLETED: number;
}

const getQuery = `
SELECT * FROM ${tableName}
`;

async function getDailyProgress(): Promise<DailyProgress[]> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<DailyProgress> = await connection.execute(getQuery, {}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows) {
            return result.rows;
        }
        return [];
    }
    catch (err) {
        throw new Error(`getDailyProgress: ${err}`);
    }
}

export { createTableDailyProgress, insertDailyProgress, updateDailyProgress, truncateDailyProgress, getDailyProgress };