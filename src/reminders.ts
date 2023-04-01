import { ChannelType, Client, TextChannel } from 'discord.js';
import schedule from 'node-schedule';
import logger from './logger';
import { getReminders, insertReminder, deleteReminder } from './sql/reminders';

function createReminder(id: number, channel: TextChannel, date: Date, message: string) {
    const job = schedule.scheduleJob(date, function() {
        channel.send(message).catch((err: Error) => logger.error({
            message: err.message,
            stack: err.stack
        }));
    });
    job.on('success',  () => {
        deleteReminder(id).catch((err: Error) => logger.error({
            message: err.message,
            stack: err.stack
        }));
    });
}

async function loadReminders(client: Client) {
    const reminders = await getReminders();
    for (const reminder of reminders) {
        const channel = await client.channels.fetch(reminder.CHANNEL_ID);
        const date = new Date(`${reminder.TIME} UTC`);
        if (date < new Date() || !channel) {
            deleteReminder(reminder.ID).catch((err: Error) => logger.error({
                message: err.message,
                stack: err.stack
            }));
        }
        else if (channel.type === ChannelType.GuildText) {
            createReminder(reminder.ID, channel, date, reminder.MESSAGE);
        }
    }
}

async function newReminder(channel: TextChannel, date: Date, message: string) {
    const id = await insertReminder(channel.id, date.toISOString().slice(0, 19).replace('T', ' '), message);
    if (id) {
        createReminder(id, channel, date, message);
    }
}

export { loadReminders, newReminder };