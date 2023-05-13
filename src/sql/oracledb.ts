import * as dotenv from 'dotenv';
dotenv.config();
import oracledb from 'oracledb';
import { createTableCurrentDisperseStreak } from './current-disperse-streak';
import { createTableDisperseStreakBreaks } from './disperse-streak-breaks';
import { createTableDisperseStreakHighscore } from './disperse-streak-highscore';
import { createTableGamersStats } from './gamers-stats';
import { createTableKnitCount } from './knit-count';
import { createTableSneezeCount } from './sneeze-count';
import { createTableReminders } from './reminders';
import { createTableTimeInVoice } from './time-in-voice';
import { createTableAudioCount } from './audio-count';
import { createTableUserIdPairs, createTableTimeInVoiceTogether } from './time-in-voice-together';
import { logError } from '../logger';

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

    const createTableQueries = [createTableCurrentDisperseStreak, createTableDisperseStreakBreaks, createTableDisperseStreakHighscore, createTableGamersStats, createTableKnitCount, createTableSneezeCount, createTableReminders, createTableTimeInVoice, createTableAudioCount, createTableUserIdPairs, createTableTimeInVoiceTogether];

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