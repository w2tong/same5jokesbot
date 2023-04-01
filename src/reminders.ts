import { ChannelType, Client, TextChannel } from 'discord.js';
import schedule from 'node-schedule';
import logger from './logger';
import { getReminders, insertReminder, deleteReminder } from './sql/reminders';

function scheduleReminder(channel: TextChannel, date: Date, message: string, id?: string) {
    let job: schedule.Job;
    if (id) {
        job = schedule.scheduleJob(id, date, function() {
            channel.send(message).catch((err: Error) => logger.error({
                message: err.message,
                stack: err.stack
            }));
        });
    }
    else {
        job = schedule.scheduleJob(date, function() {
            channel.send(message).catch((err: Error) => logger.error({
                message: err.message,
                stack: err.stack
            }));
        });
    }

    job.on('success',  () => {
        deleteReminder(job.name).catch((err: Error) => logger.error({
            message: err.message,
            stack: err.stack
        }));
    });

    return job.name;
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
            scheduleReminder(channel, date, reminder.MESSAGE, reminder.ID);
        }
    }
}

async function newReminder(userId:string, channel: TextChannel, date: Date, message: string) {
    const id = scheduleReminder(channel, date, message);
    await insertReminder(id, userId, channel.id, date.toISOString().slice(0, 19).replace('T', ' '), message);
}

export { loadReminders, newReminder };