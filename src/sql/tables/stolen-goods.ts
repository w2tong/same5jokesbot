import oracledb from 'oracledb';
import { selectExecuteOptions } from '../query-options';

const createTableStolenGoods = {
    name: 'STOLEN_GOODS',
    query: `
        CREATE TABLE stolen_goods (
            id VARCHAR2(255) PRIMARY KEY,
            stealer_id VARCHAR2(64) NOT NULL,
            victim_id VARCHAR2(64) NOT NULL,
            points NUMBER NOT NULL,
            time TIMESTAMP NOT NULL
        )
    `
};

const getQuery = `
SELECT *
FROM stolen_goods
`;

interface StolenGood {
    ID: string;
    STEALER_ID: string;
    VICTIM_ID: string;
    POINTS: number;
    TIME: string;
}
async function getStolenGoods(): Promise<StolenGood[]> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<StolenGood> = await connection.execute(getQuery, {}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows) {
            return result.rows;
        }
        return [];
    }
    catch (err) {
        throw new Error(`getStolenGoods: ${err}`);
    }
}

const insertQuery = `
INSERT INTO stolen_goods( id, stealer_id, victim_id, points, time ) 
VALUES( :id, :stealerId, :victimId, :points, TO_TIMESTAMP(:time, 'YYYY-MM-DD HH24:MI:SS') )
`;

async function insertStolenGood(id: string, stealerId: string, victimId: string, points: number, time: string) {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(insertQuery, {id, stealerId, victimId, points, time});
        await connection.close();
        return true;
    }
    catch (err) {
        throw new Error(`insertStolenGood: ${err}`);
        return false;
    }
}

const deleteQuery = `
DELETE FROM stolen_goods
WHERE id = :id
`;
async function deleteStolenGood(id: string) {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(deleteQuery, {id});
        await connection.close();
        return true;
    }
    catch (err) {
        throw new Error(`deleteStolenGood: ${err}`);
        return false;
    }
}

const deleteUserQuery = `
DELETE FROM stolen_goods
WHERE stealer_id = :userId
`;
async function deleteUserStolenGoods(userId: string) {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(deleteUserQuery, {userId});
        await connection.close();
        return true;
    }
    catch (err) {
        throw new Error(`deleteUserStolenGoods: ${err}`);
        return false;
    }
}

const getUserQuery = `
SELECT *
FROM stolen_goods
WHERE user_id = :userId
ORDER BY time ASC
`;
async function getUserStolenGoods(userId: string): Promise<StolenGood[]> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<StolenGood> = await connection.execute(getUserQuery, {userId}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows) {
            return result.rows;
        }
        return [];
    }
    catch (err) {
        throw new Error(`getUserStolenGoods: ${err}`);
    }

}

export { createTableStolenGoods, getStolenGoods, insertStolenGood, deleteStolenGood, deleteUserStolenGoods, getUserStolenGoods };