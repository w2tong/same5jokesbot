import * as dotenv from 'dotenv';
dotenv.config();
import oracledb from 'oracledb';
import logger from './logger';
import queries from './sql/queries';

oracledb.initOracleClient({ libDir: 'C:\\oracle\\instantclient_21_9' });
let connection: oracledb.Connection;
oracledb.autoCommit = true;

const selectExecuteOptions = { outFormat: oracledb.OUT_FORMAT_OBJECT };

async function initOracleDB() {
    try {
        connection = await oracledb.getConnection({
            user: process.env.ORACLEDB_USER,
            password: process.env.ORACLEDB_PW,
            connectString: process.env.ORACLEDB_CONN_STR
        });

        connection.execute(queries.createDisperseCurrentStreakTable).catch((err: Error) => {
            logger.error({
                message: err.message,
                stack: err.stack
            });
        });
        connection.execute(queries.createDisperseStreakBreaksTable).catch((err: Error) => {
            logger.error({
                message: err.message,
                stack: err.stack
            });
        });
        connection.execute(queries.createDisperseStreakHighscoreTable).catch((err: Error) => {
            logger.error({
                message: err.message,
                stack: err.stack
            });
        });
        connection.execute(queries.createGamersCounterTable).catch((err: Error) => {
            logger.error({
                message: err.message,
                stack: err.stack
            });
        });
    } catch (err) {
        console.log(err);
    }
}

interface DisperseCurrentStreak {
    USER_ID: string,
    STREAK: number
}
async function getDisperseCurrentStreak(guildId: string): Promise<DisperseCurrentStreak> {
    const result: oracledb.Result<DisperseCurrentStreak> = await connection.execute(queries.getDisperseCurrentStreak, {guildId}, selectExecuteOptions);
    if (result && result.rows && result.rows[0]) {
        return result.rows[0];
    }
    return {USER_ID: '', STREAK: 0};
}

function updateDisperseCurrentStreak(guildId: string, userId: string, streak: number) {
    connection.execute(queries.updateDisperseCurrentStreak, {guildId, userId, streak}).catch((err: Error) => {
        logger.error({
            message: `oracledb.ts - updateDisperseCurrentStreak ${err.message}`,
            stack: err.stack
        });
    });
}

interface DisperseStreakBreaks{
    BREAKS: number,
    SCORE: number
}
async function getDisperseStreakBreaks(userId: string): Promise<DisperseStreakBreaks|null> {
    const result: oracledb.Result<DisperseStreakBreaks> = await connection.execute(queries.getDisperseStreakBreaks, {userId}, selectExecuteOptions);
    if (result && result.rows && result.rows[0]) {
        return result.rows[0];
    }
    return null;
}

function updateDisperseStreakBreaks(userId: string, score: number) {
    connection.execute(queries.updateDisperseStreakBreaks, {userId, score}).catch((err: Error) => {
        logger.error({
            message: `oracledb.ts - updateDisperseStreakBreaks ${err.message}`,
            stack: err.stack
        });
    });
}

interface DisperseStreakHighscore {
    USER_ID: string,
    STREAK: number
}
async function getDisperseStreakHighscore(guildId: string): Promise<DisperseStreakHighscore|null> {
    const result: oracledb.Result<DisperseStreakHighscore> = await connection.execute(queries.getDisperseStreakHighScore, {guildId}, selectExecuteOptions);
    if (result && result.rows) {
        return result.rows[0];
    }
    return null;
}

function updateDisperseStreakHighScore(guildId: string, userId: string, streak: number) {
    connection.execute(queries.updateDisperseStreakHighScore, {guildId, userId, streak}).catch((err: Error) => {
        logger.error({
            message: `oracledb.ts - updateDisperseStreakHighScore ${err.message}`,
            stack: err.stack
        });
    });
}

interface GamersCounter {
    DISCHARGE: number,
    DISPERSE: number,
    RISE_UP: number
}
async function getGamersCounter(userId: string): Promise<GamersCounter|null> {
    const result: oracledb.Result<GamersCounter> = await connection.execute(queries.getGamersCounter, {userId}, selectExecuteOptions);
    if (result && result.rows) {
        return result.rows[0];
    }
    return null;
}

function updateGamersCounter(userId: string, gamersWord: string) {
    let query = '';
    switch(gamersWord) {
    case 'Discharge!':
        query = queries.updateGamersCounterDischarge;
        break;
    case 'Disperse!':
        query = queries.updateGamersCounterDisperse;
        break;
    case 'Rise up!':
        query = queries.updateGamersCounterRiseUp;
        break;
    }
    connection.execute(query, {userId}).catch((err: Error) => {
        logger.error({
            message: `oracledb.ts - updateGamersCounter: ${err.message}`,
            stack: err.stack
        });
    });
}

export {getDisperseCurrentStreak, updateDisperseCurrentStreak, getDisperseStreakBreaks, updateDisperseStreakBreaks, getDisperseStreakHighscore, getGamersCounter, initOracleDB, updateDisperseStreakHighScore, updateGamersCounter};