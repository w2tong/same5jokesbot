import oracledb from 'oracledb';
import { selectExecuteOptions } from '../query-options';

const createTableCronMessage = {
    name: 'CRON_MESSAGE',
    query: `
        CREATE TABLE cron_message (
            id VARCHAR2(64) PRIMARY KEY,
            creator_id VARCHAR2(64) NOT NULL,
            channel_id VARCHAR2(64) NOT NULL,
            message VARCHAR2(255) NOT NULL,
            cron_rule VARCHAR2(128) NOT NULL,
            mentionable VARCHAR2(64)
        )
    `
};

const insertQuery = `
INSERT INTO cron_message( id, creator_id, channel_id, message, cron_rule ) 
VALUES( :id, :creatorId, :channelId, :message, :cronRule )
`;

const insertWithMentionQuery = `
INSERT INTO cron_message( id, creator_id, channel_id, message, cron_rule, mentionable ) 
VALUES( :id, :creatorId, :channelId, :message, :cronRule, :mentionable )
`;

async function insertCronMessage(id: string, creatorId: string, channelId: string, message: string, cronRule: string, mentionable?: string) {
    try {
        const connection = await oracledb.getConnection();
        if (mentionable) {
            await connection.execute(insertWithMentionQuery, {id, creatorId, channelId, message, cronRule, mentionable});
        }
        else {
            await connection.execute(insertQuery, {id, creatorId, channelId, message, cronRule});
        }
        
        await connection.close();
    }
    catch (err) {
        throw new Error(`insertCronMessage: ${err}`);
    }
}

const getQuery = `
SELECT id, creator_id, channel_id, message, cron_rule, mentionable
FROM cron_message
`;
interface CronMessage {
    ID: string;
    CREATOR_ID: string;
    CHANNEL_ID: string;
    MESSAGE: string;
    CRON_RULE: string;
    MENTIONABLE?: string;
}
async function getCronMessages(): Promise<CronMessage[]> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<CronMessage> = await connection.execute(getQuery, {}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows) {
            return result.rows;
        }
        return [];
    }
    catch (err) {
        throw new Error(`getCronMessages: ${err}`);
    }
}

export { createTableCronMessage, insertCronMessage, getCronMessages };
export type { CronMessage };