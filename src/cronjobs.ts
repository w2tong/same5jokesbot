import { ChannelType, Client, EmbedBuilder } from 'discord.js';
import schedule from 'node-schedule';
// import oracledb from 'oracledb';
import * as dotenv from 'dotenv';
dotenv.config();
import { scheduleUpdateTimeInVoiceCronJob, scheduleUpdateTimeInVoiceTogetherCronJob, scheduleUpdateCringePointsCronJob } from './timeInVoice';
import { scheduleEndLotteryCronJob, scheduleLotteryAutoBuyCronJob, scheduleNewLotteryCronJob } from './commands/lottery/lotteryManager'; 
import { fetchChannel } from './util/discordUtil';
import { scheduleDailyTaxWelfareCronJob } from './taxes-welfare';
import { scheduleDailiesCronJob } from './daily/dailyManager';
import { emotes } from './util/emotes';
import { loadCronMessages } from './commands/cron-message/cronMessageManager';

type CronRule = string | number | schedule.RecurrenceRule | schedule.RecurrenceSpecDateRange | schedule.RecurrenceSpecObjLit
function createMessageCronJob(client: Client, channelId: string, rule: CronRule, msg: string) {
    schedule.scheduleJob(rule, async function() {
        const channel = await fetchChannel(client, channelId);
        if (channel && channel.type === ChannelType.GuildText) {
            channel.send(msg).catch(console.error);
        }
    });
}

function createEmbedCronJob(client: Client, channelId: string, rule: CronRule, embed: EmbedBuilder) {
    schedule.scheduleJob(rule, async function() {
        const channel = await fetchChannel(client, channelId);
        if (channel && channel.type === ChannelType.GuildText) {
            channel.send({embeds: [embed]}).catch(console.error);
        }
    });
}

// function createOracleDBLogStatisticsCronJob() {
//     schedule.scheduleJob('0 * * * *', function() {
//         const pool = oracledb.getPool();
//         pool.logStatistics();
//     });
// }

async function createCronJobs(client: Client) {
    if (process.env.MAIN_CHANNEL_ID) {
        // Weekly Tuesday reminder
        createMessageCronJob(client, process.env.MAIN_CHANNEL_ID, { second: 0, minute: 0, hour: 17, dayOfWeek: 2, tz: 'America/Toronto' }, 'Where 11.0');
    }
    
    if (process.env.NYT_CHANNEL_ID) {
        // NYT Games reset
        createMessageCronJob(client, process.env.NYT_CHANNEL_ID, { second: 0, minute: 0, hour: 0, tz: 'America/Toronto' }, `NYT Games time ${emotes.POGCRAZY}`);
    }

    // if (process.env.NODE_ENV === 'production') {
    //     createOracleDBLogStatisticsCronJob();
    // }

    scheduleUpdateTimeInVoiceCronJob();
    scheduleUpdateTimeInVoiceTogetherCronJob();
    scheduleUpdateCringePointsCronJob(client);
    scheduleNewLotteryCronJob(client);
    scheduleEndLotteryCronJob(client);
    scheduleLotteryAutoBuyCronJob(client);
    scheduleDailyTaxWelfareCronJob(client);
    scheduleDailiesCronJob(client);

    await loadCronMessages(client);
}

export { createMessageCronJob, createEmbedCronJob, createCronJobs };
export type { CronRule };