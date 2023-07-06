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

const getUserQuery = `
SELECT lottery_ticket.*
FROM lottery_ticket
WHERE user_id = :userId
AND lottery_id = :lotteryId
`;

async function getUserLotteryTickets(userId: string, lotteryId: string): Promise<Array<LotteryTicket>> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<LotteryTicket> = await connection.execute(getUserQuery, {userId, lotteryId}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows;
        }
        return [];
    }
    catch (err) {
        throw new Error(`getUserLotteryTickets: ${err}`);
    }
}

const getUnclaimedQuery = `
SELECT user_id
FROM lottery_ticket
WHERE lottery_id = :lotteryId
AND claimed = 0
GROUP BY user_id
`;
async function getUnclaimedUsers(lotteryId: string) {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<string> = await connection.execute(getUnclaimedQuery, {lotteryId});
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows;
        }
        return [];
    }
    catch (err) {
        throw new Error(`getUnclaimedUsers: ${err}`);
    }
}

interface JackpotWinner {
    USER_ID: string;
    COUNT: number;
}
const getJackpotWinnersQuery = `
SELECT user_id, count(user_id) AS count
FROM lottery
JOIN lottery_ticket ON lottery.id = lottery_ticket.lottery_id
WHERE id = :lotteryId
AND lottery.numbers = lottery_ticket.numbers
GROUP BY user_id
`;
async function getJackpotWinners(lotteryId: string) {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<JackpotWinner> = await connection.execute(getJackpotWinnersQuery, {lotteryId}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows;
        }
        return [];
    }
    catch (err) {
        throw new Error(`getJackpotWinners: ${err}`);
    }
}

const claimLotteryTicketsQuery = `
UPDATE lottery_ticket
SET claimed = 1
WHERE lottery_id = :lotteryId
AND user_id = :userId
`;
const claimTicketsBindDefs = {
    lotteryId: {type: oracledb.STRING, maxSize: 36},
    userId: {type: oracledb.STRING, maxSize: 64}
};
async function claimLotteryTickets(updates: Array<{lotteryId: string, userId: string}>) {
    try {
        const connection = await oracledb.getConnection();
        await connection.executeMany(claimLotteryTicketsQuery, updates, {bindDefs: claimTicketsBindDefs});
        await connection.close();
    }
    catch (err) {
        throw new Error(`claimLotteryTickets: ${err}`);
    }
}

export { LotteryTicket, JackpotWinner, createTableLotteryTicket, insertLotteryTicket, getUserLotteryTickets, getUnclaimedUsers, getJackpotWinners, claimLotteryTickets };