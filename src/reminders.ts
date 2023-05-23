import { ChannelType, Client, TextChannel } from 'discord.js';
import schedule from 'node-schedule';
import { logError } from './logger';
import { getReminders, insertReminder, deleteReminder } from './sql/reminders';
import { fetchChannel } from './util';

function scheduleReminder(channel: TextChannel, date: Date, message: string, id?: string) {
    let job: schedule.Job;
    if (id) {
        job = schedule.scheduleJob(id, date, function() {
            channel.send(message).catch(logError);
        });
    }
    else {
        job = schedule.scheduleJob(date, function() {
            channel.send(message).catch(logError);
        });
    }

    job.on('success',  () => {
        void deleteReminder(job.name);
    });

    return job.name;
}

async function loadReminders(client: Client) {
    const reminders = await getReminders();
    for (const reminder of reminders) {
        const channel = await fetchChannel(client, reminder.CHANNEL_ID);
        const date = new Date(`${reminder.TIME} UTC`);
        if (date < new Date() || !channel) {
            void deleteReminder(reminder.ID);
        }
        else if (channel.type === ChannelType.GuildText) {
            scheduleReminder(channel, date, reminder.MESSAGE, reminder.ID);
        }
    }
}

async function newReminder(userId:string, channel: TextChannel, date: Date, message: string) {
    const id = scheduleReminder(channel, date, message);
    const inserted = await insertReminder(id, userId, channel.id, date.toISOString().slice(0, 19).replace('T', ' '), message);
    return inserted;
}

export { loadReminders, newReminder };