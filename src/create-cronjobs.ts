import { ChannelType, Client, TextChannel } from 'discord.js';
import * as dotenv from 'dotenv';
dotenv.config();
import schedule from 'node-schedule';
import { logError } from './logger';
import  timeInVoice from './time-in-voice';
import { updateTimeInVoice } from './sql/time-in-voice';

// Hourly water and posture check cronjob
function createWaterPostureCronJob(channel: TextChannel) {
    schedule.scheduleJob({ second: 0, minute: 0, tz: 'America/Toronto' }, function() {
        channel.send('<@&899160433548722176> Water Check. Posture Check.').catch(logError);
    });
}

// Daily Wordle reminder cronjob
function createWordleCronJob(channel: TextChannel) {
    schedule.scheduleJob({ second: 0, minute: 0, hour: 0, tz: 'America/Toronto' }, function() {
        channel.send('Wordle time POGCRAZY').catch(logError);
    });
}

// Weekly Tuesday WoW Reset cronjob
function createWoWResetCronJob(channel: TextChannel) {
    schedule.scheduleJob({ second: 0, minute: 0, hour: 17, dayOfWeek: 2, tz: 'America/Toronto' }, function() {
        channel.send('When Mythic+/Vault of the Incarnates/World Boss/PvP/Timewalking').catch(logError);
    });
}

// Weekly Tuesday Div 2 / Sons of the Forest Session
function createTuesdayScheduleCronJob(channel: TextChannel) {
    schedule.scheduleJob({ second: 0, minute: 0, hour: 21, dayOfWeek: 2, tz: 'America/Toronto' }, function() {
        channel.send('Where Sons of the Forest/Divnity: Original Sin 2').catch(logError);
    });
}

function createUpdateTimeInVoiceCronJob(client: Client) {
    schedule.scheduleJob('*/10 * * * *', function() {
        const currTime = Date.now();
        for (const [userId, {guildId, channel, time}] of Object.entries(timeInVoice.userJoinTime)) {
            const date = new Date(time).toISOString().slice(0, 10);
            void updateTimeInVoice(userId, guildId, date, currTime - time);
            timeInVoice.updatePairs(userId);
            timeInVoice.userJoinTime[userId].time = currTime;
        }
    });
}

const waterPostureChannelId = '899162908498468934';
const wordleChannelId = '933772784948101120';

function createCronJobs(client: Client) {

    const waterPostureChannel = client.channels.cache.get(waterPostureChannelId);
    if (waterPostureChannel && waterPostureChannel.type === ChannelType.GuildText) {
        // createWaterPostureCronJob(waterPostureChannel);
    }

    const wordleChannel = client.channels.cache.get(wordleChannelId);
    if (wordleChannel && wordleChannel.type === ChannelType.GuildText) {
        // createWordleCronJob(wordleChannel);
    }

    const mainChannel = client.channels.cache.get(process.env.MAIN_CHANNEL_ID ?? '');
    if (mainChannel && mainChannel.type === ChannelType.GuildText) {
        // createWoWResetCronJob(mainChannel);
        createTuesdayScheduleCronJob(mainChannel);
    }

    createUpdateTimeInVoiceCronJob(client);
}

export default createCronJobs;