import * as dotenv from 'dotenv';
dotenv.config();
import oracledb from 'oracledb';
import { createTableCurrentDisperseStreakQuery } from './current-disperse-streak';
import { createTableDisperseStreakBreaksQuery } from './disperse-streak-breaks';
import { createTableDisperseStreakHighscoreQuery } from './disperse-streak-highscore';
import { createTableGamersStatsQuery } from './gamers-stats';
import { createTableKnitCountQuery } from './knit-count';
import { createTableSneezeCountQuery } from './sneeze-count';
import { createTableRemindersQuery } from './reminders';

oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_DIR });
oracledb.autoCommit = true;

async function initOracleDB() {
    await oracledb.createPool({
        user: process.env.ORACLEDB_USER,
        password: process.env.ORACLEDB_PW,
        connectString: process.env.ORACLEDB_CONN_STR
    });

    const createTableQueries = [createTableCurrentDisperseStreakQuery, createTableDisperseStreakBreaksQuery, createTableDisperseStreakHighscoreQuery, createTableGamersStatsQuery, createTableKnitCountQuery, createTableSneezeCountQuery, createTableRemindersQuery];

    const connection = await oracledb.getConnection();
    for(const query of createTableQueries) {
        connection.execute(query).catch((err: Error) => {
            // console.log(err);
            // logger.error({
            //     message: err.message,
            //     stack: err.stack
            // });
        });
    }
}

export {initOracleDB};