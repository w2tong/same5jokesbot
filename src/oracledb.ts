import * as dotenv from 'dotenv';
dotenv.config();
import oracledb from 'oracledb';
import logger from './logger';
import queries from './sql/queries';

oracledb.initOracleClient({ libDir: 'C:\\oracle\\instantclient_21_9' });
let connection: oracledb.Connection;
oracledb.autoCommit = true;

async function initOracleDB() {

    try {
        connection = await oracledb.getConnection({
            user: process.env.ORACLEDB_USER,
            password: process.env.ORACLEDB_PW,
            connectString: process.env.ORACLEDB_CONN_STR
        });

        connection.execute(queries.createDisperseStreakHighscoreTable).catch((err: Error) => {
            logger.error({
                message: err.message,
                stack: err.stack
            });
        });
        connection.execute(queries.createDisperseStreakCurrentScoreTable).catch((err: Error) => {
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

async function updateDisperseStreak(streak: number) {
    const result = await connection.execute('SELECT last_name FROM employees', {streak: streak});
}

interface DisperseStreak {
    streak: number,
    userId: string
}
async function getDisperseStreak(guildId: string): Promise<DisperseStreak> {
    const result = await connection.execute('SELECT last_name FROM employees', {guildId});
    // return result;
    const dummyStreak = {
        streak: 1,
        userId: '158048359591051274'
    };
    return dummyStreak;
}

interface GamersCounter {
    USER_ID: number,
    DISCHARGE: number,
    DISPERSE: number,
    RISE_UP: number
}
async function getGamersCounter(userId: string): Promise<GamersCounter|null> {
    const result: oracledb.Result<GamersCounter> = await connection.execute(queries.getGamersCounter, {userId}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    if (result && result.rows) {
        return result.rows[0];
    }
    return null;
}

async function updateGamersCounter(userId: string, gamersWord: string) {
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
    await connection.execute(query, {userId}).catch((err: Error) => {
        logger.error({
            message: err.message,
            stack: err.stack
        });
    });
}

export {getDisperseStreak, getGamersCounter, initOracleDB, updateDisperseStreak, updateGamersCounter};