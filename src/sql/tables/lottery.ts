import oracledb from 'oracledb';
import { selectExecuteOptions } from '../query-options';

const createTableLottery = {
    name: 'LOTTERY',
    query: `
        CREATE TABLE lottery (
            id VARCHAR2(36) PRIMARY KEY NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            numbers VARCHAR(32) NOT NULL,
            jackpot NUMBER NOT NULL
        )
    `
};

const insertQuery = `
INSERT INTO lottery (id, start_date, end_date, numbers, jackpot)
VALUES (SYS_GUID(), TO_TIMESTAMP(:startDate, 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP(:endDate, 'YYYY-MM-DD HH24:MI:SS'), :numbers, :jackpot)
`;

async function insertLottery(startDate: string, endDate: string, numbers: string, jackpot: number) {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(insertQuery, {startDate, endDate, numbers, jackpot});
        await connection.close();
    }
    catch (err) {
        throw new Error(`insertLottery: ${err}`);
    }
}

interface Lottery {
    ID: string;
    START_DATE: string;
    END_DATE: string;
    NUMBERS: string;
    JACKPOT: number;
}

const getCurrentQuery = `
SELECT *
FROM lottery
ORDER BY end_date DESC
FETCH FIRST 1 ROWS ONLY
`;

async function getCurrentLottery(): Promise<Lottery|null> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<Lottery> = await connection.execute(getCurrentQuery, {}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows[0];
        }
        return null;
    }
    catch (err) {
        throw new Error(`getCurrentLottery: ${err}`);
    }
}

const getActiveQuery = `
SELECT *
FROM lottery
WHERE SYSDATE BETWEEN start_date AND end_date
`;

async function getActiveLottery(): Promise<Lottery|null> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<Lottery> = await connection.execute(getActiveQuery, {}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows[0];
        }
        return null;
    }
    catch (err) {
        throw new Error(`getActiveLottery: ${err}`);
    }
}

export { Lottery, createTableLottery, insertLottery, getCurrentLottery, getActiveLottery };