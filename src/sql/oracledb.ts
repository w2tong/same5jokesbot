import * as dotenv from 'dotenv';
dotenv.config();
import oracledb from 'oracledb';
import { createTableCurrentDisperseStreak } from './tables/current-disperse-streak';
import { createTableDisperseStreakBreaks } from './tables/disperse-streak-breaks';
import { createTableDisperseStreakHighscore } from './tables/disperse-streak-highscore';
import { createTableGamersStats } from './tables/gamers-stats';
import { createTableReminders } from './tables/reminders';
import { createTableTimeInVoice } from './tables/time-in-voice';
import { createTableAudioCount } from './tables/audio-count';
import { createTableUserIdPairs, createTableTimeInVoiceTogether } from './tables/time-in-voice-together';
import { createTableCringePoints } from './tables/cringe-points';
import { createTableLottery } from './tables/lottery';
import { createTableLotteryTicket } from './tables/lottery-ticket';
import { createTableProfits } from './tables/profits';
import { createTableStolenGoods } from './tables/stolen-goods';
import { logError } from '../logger';

const createTableQueries = [createTableCurrentDisperseStreak, createTableDisperseStreakBreaks, createTableDisperseStreakHighscore, createTableGamersStats, createTableReminders, createTableTimeInVoice, createTableAudioCount, createTableUserIdPairs, createTableTimeInVoiceTogether, createTableCringePoints, createTableLottery, createTableLotteryTicket, createTableProfits, createTableStolenGoods];

oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_DIR });
oracledb.autoCommit = true;
if (process.env.ORACLEDB_POOL_MIN) oracledb.poolMin = parseInt(process.env.ORACLEDB_POOL_MIN);
if (process.env.ORACLEDB_POOL_MAX) oracledb.poolMax = parseInt(process.env.ORACLEDB_POOL_MAX);

const procedure =`
    declare
    nCount NUMBER;
    v_sql LONG;
    
    begin
    SELECT count(*) into nCount FROM dba_tables where table_name = :name;
    IF(nCount <= 0)
    THEN
    v_sql := :query;
    execute immediate v_sql;
    
    END IF;
    end;
`;

async function initOracleDB() {
    await oracledb.createPool({
        user: process.env.ORACLEDB_USER,
        password: process.env.ORACLEDB_PW,
        connectString: process.env.ORACLEDB_CONN_STR,
        enableStatistics: true
    });

    const connection = await oracledb.getConnection();
    for(const {name, query} of createTableQueries) {
        try {
            await connection.execute(procedure, {name, query});
        }
        catch(err) {
            logError(`${name}: ${err}`);
        }
    }
    await connection.close();
}

export {initOracleDB};