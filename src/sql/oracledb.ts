import * as dotenv from 'dotenv';
dotenv.config();
import oracledb from 'oracledb';
import { createTableCurrentDisperseStreak } from './tables/current_disperse_streak';
import { createTableDisperseStreakBreaks } from './tables/disperse_streak_breaks';
import { createTableDisperseStreakHighscore } from './tables/disperse_streak_highscore';
import { createTableGamersStats } from './tables/gamers_stats';
import { createTableReminders } from './tables/reminders';
import { createTableTimeInVoice } from './tables/time_in_voice';
import { createTableAudioCount } from './tables/audio-count';
import { createTableUserIdPairs, createTableTimeInVoiceTogether } from './tables/time_in_voice-together';
import { createTableCringePoints } from './tables/cringe_points';
import { createTableLottery } from './tables/lottery';
import { createTableLotteryTicket } from './tables/lottery_ticket';
import { createTableLotteryAutoBuy } from './tables/lottery_auto_buy';
import { createTableProfits, updateTableProfits } from './tables/profits';
import { createTableStolenGoods } from './tables/stolen_goods';
import { createTableDailyProgress } from './tables/daily_progress';
import { createTableUpgrades, updateTableUpgrades } from './tables/upgrades';
import { createTableDailyCoins } from './tables/daily_coins';
import { createTableABCharacters, updateTableABCharacters } from './tables/ab_characters';
import { createTableABInventory } from './tables/ab_inventory';
import { createTableABEquipment } from './tables/ab_equipment';
import { createTableCronMessage } from './tables/cron_message';
import { createTableUserIntro } from './tables/user_intro';

const createTableQueries = [createTableCurrentDisperseStreak, createTableDisperseStreakBreaks, createTableDisperseStreakHighscore, createTableGamersStats, createTableReminders, createTableTimeInVoice, createTableAudioCount, createTableUserIdPairs, createTableTimeInVoiceTogether, createTableCringePoints, createTableLottery, createTableLotteryTicket, createTableLotteryAutoBuy, createTableProfits, createTableStolenGoods, createTableDailyProgress, createTableUpgrades, createTableDailyCoins, createTableABCharacters, createTableABInventory, createTableABEquipment, createTableCronMessage, createTableUserIntro];

const updateTableQueries = [...updateTableProfits, ...updateTableUpgrades, ...updateTableABCharacters];

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
            console.error(`${name}: ${err}\n${query}`);
        }
    }

    for (const query of updateTableQueries) {
        try {
            await connection.execute(query);
        }
        catch(err) {
            console.error(`${err}\n${query}`);
        }
    }

    await connection.close();
}

export {initOracleDB};