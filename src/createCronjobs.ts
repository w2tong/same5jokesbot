import { ChannelType, Client } from 'discord.js';
import schedule from 'node-schedule';
import oracledb from 'oracledb';
import * as dotenv from 'dotenv';
dotenv.config();
import { logError } from './logger';
import { scheduleUpdateTimeInVoiceCronJob, scheduleUpdateTimeInVoiceTogetherCronJob, scheduleUpdateCringePointsCronJob } from './timeInVoice';
import { scheduleEndLotteryCronJob, scheduleNewLotteryCronJob } from './commands/lottery/lotteryManager'; 
import { fetchChannel } from './util/discordUtil';
import { scheduleDailyTaxWelfareCronJob } from './taxes-welfare';
import { scheduleDailiesCronJob } from './daily/dailyManager';

// Weekly Tuesday reminder
function createTuesdayScheduleCronJob(client: Client, channelId: string) {
    schedule.scheduleJob({ second: 0, minute: 0, hour: 21, dayOfWeek: 2, tz: 'America/Toronto' }, async function() {
        const channel = await fetchChannel(client, channelId);
        if (channel && channel.type === ChannelType.GuildText) {
            channel.send('Where 10.1.5').catch(logError);
        }
    });
}

function createOracleDBLogStatisticsCronJob() {
    schedule.scheduleJob('0 * * * *', function() {
        const pool = oracledb.getPool();
        pool.logStatistics();
    });
}

function createCronJobs(client: Client) {
    if (process.env.MAIN_CHANNEL_ID) {
        createTuesdayScheduleCronJob(client, process.env.MAIN_CHANNEL_ID);
    }

    // if (process.env.NODE_ENV === 'production') {
    //     createOracleDBLogStatisticsCronJob();
    // }

    scheduleUpdateTimeInVoiceCronJob();
    scheduleUpdateTimeInVoiceTogetherCronJob();
    scheduleUpdateCringePointsCronJob(client);
    scheduleNewLotteryCronJob(client);
    scheduleEndLotteryCronJob(client);
    scheduleDailyTaxWelfareCronJob(client);
    scheduleDailiesCronJob(client);
}

export default createCronJobs;