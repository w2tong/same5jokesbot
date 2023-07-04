import oracledb from 'oracledb';
import { selectExecuteOptions } from '../query-options';

const createTableLotteryTicket = {
    name: 'LOTTERY_TICKET',
    query: `
        CREATE TABLE lottery_ticket (
            lottery_id VARCHAR2(36) NOT NULL,
            user_id VARCHAR2(64) NOT NULL,
            numbers VARCHAR(32) NOT NULL,
            claimed NUMBER(1,0) DEFAULT 0 NOT NULL,
            CONSTRAINT fk_lottery_ticket
                FOREIGN KEY (lottery_id)
                REFERENCES lottery (id)
        )
    `
};

const insertQuery = `
INSERT INTO lottery_ticket (lottery_id, user_id, numbers)
VALUES (:lotteryId, :userId, :numbers)
`;

async function insertLotteryTicket(lotteryId: string, userId: string, numbers: string) {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(insertQuery, {lotteryId, userId, numbers});
        await connection.close();
    }
    catch (err) {
        throw new Error(`insertLotteryTicket: ${err}`);
    }
}

interface LotteryTicket {
    LOTTERY_ID: string;
    USER_ID: string;
    NUMBERS: string;
    CLAIMED: number;
}

const getCurrentQuery = `
SELECT lottery_ticket.*
FROM lottery_ticket
WHERE user_id = :userId
AND lottery_id = :lotteryId
`;

async function getLotteryTickets(userId: string, lotteryId: string): Promise<Array<LotteryTicket>> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<LotteryTicket> = await connection.execute(getCurrentQuery, {userId, lotteryId}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows;
        }
        return [];
    }
    catch (err) {
        throw new Error(`getLotteryTickets: ${err}`);
    }
}

export { createTableLotteryTicket, insertLotteryTicket, getLotteryTickets };