import oracledb from 'oracledb';
import logger from '../logger';
import { selectExecuteOptions } from './query-options';

const createTableRemindersQuery = `
CREATE TABLE reminders (
    id VARCHAR2(255) PRIMARY KEY,
    user_id VARCHAR2(255),
    channel_id VARCHAR2(255),
    time TIMESTAMP,
    message VARCHAR2(1000)
)
`;

const getQuery = `
SELECT id, channel_id, time, message FROM reminders
`;

interface Reminder {
    ID: string;
    CHANNEL_ID: string;
    TIME: string;
    MESSAGE: string;
}
async function getReminders(): Promise<Array<Reminder>> {
    const connection = await oracledb.getConnection();
    const result: oracledb.Result<Reminder> = await connection.execute(getQuery, {}, selectExecuteOptions);
    connection.close().catch((err: Error) => {
        logger.error({
            message: `getReminders ${err.message}`,
            stack: err.stack
        });
    });
    if (result && result.rows) {
        return result.rows;
    }
    return [];
}

const insertQuery = `
INSERT INTO reminders( id, user_id, channel_id, time, message ) 
VALUES( :id, :userId, :channelId, TO_TIMESTAMP(:time, 'YYYY-MM-DD HH24:MI:SS'), :message )
RETURN id into :id
`;

async function insertReminder(id: string, userId: string, channelId: string, time: string, message: string) {
    const connection = await oracledb.getConnection();
    await connection.execute(insertQuery, {id, userId, channelId, time, message});
    connection.close().catch((err: Error) => {
        logger.error({
            message: `insertReminder ${err.message}`,
            stack: err.stack
        });
    });
}

const deleteQuery = `
DELETE FROM reminders
WHERE id = :id
`;
async function deleteReminder(id: string) {
    const connection = await oracledb.getConnection();
    await connection.execute(deleteQuery, {id});
    connection.close().catch((err: Error) => {
        logger.error({
            message: `deleteReminder ${err.message}`,
            stack: err.stack
        });
    });
}

const getUserQuery = `
SELECT id, channel_id, time, message FROM reminders
WHERE user_id = :userId
ORDER BY time ASC
FETCH NEXT 5 ROWS ONLY
`;
async function getUserReminders(userId: string): Promise<Array<Reminder>> {
    const connection = await oracledb.getConnection();
    const result: oracledb.Result<Reminder> = await connection.execute(getUserQuery, {userId}, selectExecuteOptions);
    connection.close().catch((err: Error) => {
        logger.error({
            message: `getUserReminders ${err.message}`,
            stack: err.stack
        });
    });
    if (result && result.rows) {
        return result.rows;
    }
    return [];
}

interface ReminderCount {
    COUNT: number;
}
const getUserCountQuery = `
SELECT count(*) AS count FROM reminders
WHERE user_id = :userId
`;
async function getUserRemindersCount(userId: string): Promise<number> {
    const connection = await oracledb.getConnection();
    const result: oracledb.Result<ReminderCount> = await connection.execute(getUserCountQuery, {userId}, selectExecuteOptions);
    connection.close().catch((err: Error) => {
        logger.error({
            message: `getUserRemindersCount ${err.message}`,
            stack: err.stack
        });
    });
    if (result && result.rows) {
        return result.rows[0].COUNT;
    }
    return 0;
}

export { createTableRemindersQuery, getReminders, insertReminder, deleteReminder, getUserReminders, getUserRemindersCount };