import oracledb from 'oracledb';
import { selectExecuteOptions } from '../query-options';

const createTableCringePoints = {
    name: 'CRINGE_POINTS',
    query: `
        CREATE TABLE cringe_points (
            user_id VARCHAR2(64) PRIMARY KEY,
            points NUMBER DEFAULT 0
        )
    `
};

interface CringePoints {
    POINTS: number;
}

const getUserQuery = `
SELECT points
FROM cringe_points
WHERE user_id = :userId
`;

async function getUserCringePoints(userId: string): Promise<number|null> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<CringePoints> = await connection.execute(getUserQuery, {userId}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows[0].POINTS;
        }
        return null;
    }
    catch (err) {
        throw new Error(`getUserCringePoints: ${err}`);
    }
}

const getTopQuery = `
SELECT *
FROM cringe_points
WHERE EXISTS (SELECT 1 FROM profits WHERE cringe_points.user_id = profits.user_id)
ORDER BY points DESC
`;

interface CringePointsUser extends CringePoints {
    USER_ID: string;
}

async function getTopCringePoints(): Promise<Array<CringePointsUser>> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<CringePointsUser> = await connection.execute(getTopQuery, {}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows;
        }
        return [];
    }
    catch (err) {
        throw new Error(`getTopCringePoints: ${err}`);
    }
}

const getAllUserQuery = `
SELECT *
FROM cringe_points
WHERE user_id != ${process.env.CLIENT_ID}
ORDER BY points DESC
`;

async function getAllUserCringePoints(): Promise<Array<CringePointsUser>> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<CringePointsUser> = await connection.execute(getAllUserQuery, {}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows;
        }
        return [];
    }
    catch (err) {
        throw new Error(`getAllUserCringePoints: ${err}`);
    }
}

const updateQuery = `
MERGE INTO cringe_points dest
    USING( SELECT :userId AS user_id, :points AS points FROM dual) src
        ON( dest.user_id = src.user_id )
    WHEN MATCHED THEN
        UPDATE SET points = dest.points + src.points
    WHEN NOT MATCHED THEN
        INSERT( user_id, points ) 
        VALUES( src.user_id, src.points )
`;

type CringePointsUpdate = { userId: string, points: number }
async function updateCringePoints(arr: CringePointsUpdate[]) {
    try {
        const connection = await oracledb.getConnection();
        for (const {userId, points} of arr) {
            await connection.execute(updateQuery, {userId, points});
        }
        await connection.close();
    }
    catch (err) {
        throw new Error(`updateCringePoints: ${err}`);
    }
}

async function houseUserTransfer(arr: CringePointsUpdate[]) {
    try {
        if (!process.env.CLIENT_ID) return;
        const updates: CringePointsUpdate[] = [];
        for (const {userId, points} of arr) {
            updates.push({userId, points});
            updates.push({userId: process.env.CLIENT_ID, points: -points});
        }
        await updateCringePoints(updates);
    }
    catch (err) {
        throw new Error(`houseUserTransfer: ${err}`);
    }
}

export { createTableCringePoints, getUserCringePoints, getTopCringePoints, getAllUserCringePoints, updateCringePoints, houseUserTransfer, CringePointsUpdate };