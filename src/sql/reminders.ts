import oracledb from 'oracledb';
import { selectExecuteOptions } from './query-options';

const createTableReminders = {
    name: 'REMINDERS',
    query: `
        CREATE TABLE reminders (
            id VARCHAR2(255) PRIMARY KEY,
            user_id VARCHAR2(255),
            channel_id VARCHAR2(255),
            time TIMESTAMP,
            message VARCHAR2(1000)
        )`
};

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
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<Reminder> = await connection.execute(getQuery, {}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows) {
            return result.rows;
        }
        return [];
    }
    catch (err) {
        throw new Error(`getReminders: ${err}`);
    }
}

const insertQuery = `
INSERT INTO reminders( id, user_id, channel_id, time, message ) 
VALUES( :id, :userId, :channelId, TO_TIMESTAMP(:time, 'YYYY-MM-DD HH24:MI:SS'), :message )
RETURN id into :id
`;

async function insertReminder(id: string, userId: string, channelId: string, time: string, message: string) {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(insertQuery, {id, userId, channelId, time, message});
        await connection.close();
        return true;
    }
    catch (err) {
        throw new Error(`insertReminder: ${err}`);
        return false;
    }
}

const deleteQuery = `
DELETE FROM reminders
WHERE id = :id
`;
async function deleteReminder(id: string) {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(deleteQuery, {id});
        await connection.close();
        return true;
    }
    catch (err) {
        throw new Error(`deleteReminder: ${err}`);
        return false;
    }
}

const getUserQuery = `
SELECT id, channel_id, time, message FROM reminders
WHERE user_id = :userId
ORDER BY time ASC
FETCH NEXT 5 ROWS ONLY
`;
async function getUserReminders(userId: string): Promise<Array<Reminder>> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<Reminder> = await connection.execute(getUserQuery, {userId}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows) {
            return result.rows;
        }
        return [];
    }
    catch (err) {
        throw new Error(`getUserReminders: ${err}`);
    }

}

interface ReminderCount {
    COUNT: number;
}
const getUserCountQuery = `
SELECT count(*) AS count FROM reminders
WHERE user_id = :userId
`;
async function getUserRemindersCount(userId: string): Promise<number> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<ReminderCount> = await connection.execute(getUserCountQuery, {userId}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows) {
            return result.rows[0].COUNT;
        }
        return 0;
    }
    catch (err) {
        throw new Error(`getUserRemindersCount: ${err}`);
    }
}

export { createTableReminders, getReminders, insertReminder, deleteReminder, getUserReminders, getUserRemindersCount };