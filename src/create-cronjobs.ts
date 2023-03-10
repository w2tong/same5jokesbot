import { CronCommand, CronJob } from 'cron';
import { ChannelType, Client, TextChannel } from 'discord.js';
import * as dotenv from 'dotenv';
dotenv.config();

// Hourly water and posture check cronjob
function createWaterPostureCronJob(channel: TextChannel): CronJob {
    return createTorontoCronJob(
        '00 00 * * * *',
        (): void => {
            channel.send('<@&899160433548722176> Water Check. Posture Check.').catch(e => console.log(e));
        }
    );
}

// Daily Wordle reminder cronjob
function createWordleCronJob(channel: TextChannel): CronJob {
    return createTorontoCronJob(
        '00 00 00 * * *',
        (): void => {
            channel.send('Wordle time POGCRAZY').catch(e => console.log(e));
        }
    );
}

// Weekly Tuesday WoW Reset cronjob
function createWoWResetCronJob(channel: TextChannel): CronJob {
    return createTorontoCronJob(
        '00 00 17 * * 2',
        (): void => {
            channel.send('When Mythic+/Vault of the Incarnates/World Boss/PvP/Timewalking').catch(e => console.log(e));
        }
    );
}

// Weekly Tuesday Div 2 / Sons of the Forest Session
function createTuesdayScheduleCronJob(channel: TextChannel): CronJob {
    return createTorontoCronJob(
        '00 00 21 * * 2',
        (): void => {
            if (channel) {
                channel.send('Where Sons of the Forest/Divnity: Original Sin 2').catch(e => console.log(e));
            }
        }
    )
}

// Create cronjob with Toronto timezone
function createTorontoCronJob(cronTime: string, cronCommand: CronCommand): CronJob {
    return new CronJob(
        cronTime,
        cronCommand,
        null,
        true,
        'America/Toronto'
    )
}

const waterPostureChannelId = '899162908498468934';
const wordleChannelId = '933772784948101120';

function createCronJobs(client: Client) {

    const waterPostureChannel = client.channels.cache.get(waterPostureChannelId);
    if (waterPostureChannel && waterPostureChannel.type === ChannelType.GuildText) {
        // createWaterPostureCronJob(waterPostureChannel).start();
    }

    const wordleChannel = client.channels.cache.get(wordleChannelId);
    if (wordleChannel && wordleChannel.type === ChannelType.GuildText) {
        // createWordleCronJob(wordleChannel).start();
    }

    const mainChannel = client.channels.cache.get(process.env.MAIN_CHANNEL_ID ?? '');
    if (mainChannel && mainChannel.type === ChannelType.GuildText) {
        // createWoWResetCronJob(mainChannel).start();
        createTuesdayScheduleCronJob(mainChannel).start();
    }
}

export default createCronJobs;