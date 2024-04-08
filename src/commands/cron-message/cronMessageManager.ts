/* eslint-disable @typescript-eslint/no-base-to-string */
import { ChannelType, Client, EmbedBuilder, userMention } from 'discord.js';
import schedule from 'node-schedule';
import { getCronMessages } from '../../sql/tables/cron_message';
import { fetchChannel, fetchUser } from '../../util/discordUtil';
import { logError } from '../../logger';

const cronMessageJobs: {[jobId: string]: {job: schedule.Job, creatorId: string, creatorUsername: string, guildId: string|null, message: string, rule: string}} = {};

async function createCronMessageCronJob(client: Client, creatorId: string, guildId: string|null, channelId: string, message: string, ruleStr: string, options: {id?: string, mentionable?: string}) {
    async function callback() {
        const channel = await fetchChannel(client, channelId);
        const embed = new EmbedBuilder()
            .addFields(
                {name: 'From', value: userMention(creatorId), inline: true},
                {name: 'Message', value: message, inline: true}
            );
        if (channel && channel.type === ChannelType.GuildText) {
            channel.send({content: options.mentionable ? options.mentionable : '', embeds: [embed]}).catch(logError);
        }
    }
    const rule = JSON.parse(ruleStr) as schedule.RecurrenceSpecObjLit;
    const job = options.id ? schedule.scheduleJob(options.id, rule, callback) : schedule.scheduleJob(rule, callback);
    cronMessageJobs[job.name] = {job, creatorId, creatorUsername: (await fetchUser(client, creatorId)).username ?? 'unknown', guildId, message, rule: ruleStr};
    return job.name;
}

async function loadCronMessages(client: Client) {
    const cronMessages = await getCronMessages();
    const promises = [];
    for (const cronMsg of cronMessages) {
        promises.push(createCronMessageCronJob(client, cronMsg.CREATOR_ID, cronMsg.GUILD_ID, cronMsg.CHANNEL_ID, cronMsg.MESSAGE, cronMsg.CRON_RULE, {id: cronMsg.ID, mentionable: cronMsg.MENTIONABLE}));
    }
    await Promise.all(promises);
}

export { cronMessageJobs, createCronMessageCronJob, loadCronMessages };