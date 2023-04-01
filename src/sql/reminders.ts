import oracledb from 'oracledb';
import logger from '../logger';
import { selectExecuteOptions } from './query-options';

const createTableRemindersQuery = `
CREATE TABLE reminders (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    channel_id VARCHAR2(255),
    time TIMESTAMP,
    message VARCHAR2(1000)
)
`;

const getQuery = `
SELECT * FROM reminders
`;

interface Reminder {
    ID: number;
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
INSERT INTO reminders( channel_id, time, message ) 
VALUES( :channelId, TO_TIMESTAMP(:time, 'YYYY-MM-DD HH24:MI:SS'), :message )
RETURN id into :id
`;

interface insertReminder {
    outBinds?: {
        id: [number]
    }
}
async function insertReminder(channelId: string, time: string, message: string) {
    const connection = await oracledb.getConnection();
    const res: insertReminder = await connection.execute(insertQuery, {channelId, time, message, id: {type: oracledb.NUMBER, dir: oracledb.BIND_OUT }});
    connection.close().catch((err: Error) => {
        logger.error({
            message: `insertReminder ${err.message}`,
            stack: err.stack
        });
    });
    return res.outBinds?.id[0];
}

const deleteQuery = `
DELETE FROM reminders
WHERE id = :id
`;
async function deleteReminder(id: number) {
    const connection = await oracledb.getConnection();
    await connection.execute(deleteQuery, {id});
    connection.close().catch((err: Error) => {
        logger.error({
            message: `deleteReminder ${err.message}`,
            stack: err.stack
        });
    });
}

export { createTableRemindersQuery, getReminders, insertReminder, deleteReminder };