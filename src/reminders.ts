import { TextChannel } from 'discord.js';
import schedule from 'node-schedule';
import logger from './logger';

function createReminder(channel: TextChannel, date: Date, message: string) {
    schedule.scheduleJob(date, function() {
        channel.send(message).catch((err: Error) => logger.error({
            message: err.message,
            stack: err.stack
        }));
    });
}

export { createReminder };