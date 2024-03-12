import { ChannelType, Client, EmbedBuilder, userMention } from 'discord.js';
import schedule from 'node-schedule';
import { getCronMessages } from '../../sql/tables/cron_message';
import { CronRule } from '../../cronjobs';
import { fetchChannel } from '../../util/discordUtil';
import { logError } from '../../logger';

const cronMessageJobs: {[jobId: string]: schedule.Job} = {};

function createCronMessageCronJob(client: Client, creatorId: string, channelId: string, message: string, rule: CronRule, options: {id?: string, mentionable?: string}) {
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

    const job = options.id ? schedule.scheduleJob(options.id, rule, callback) : schedule.scheduleJob(rule, callback);
    cronMessageJobs[job.name] = job;
    return job.name;
}

schedule.scheduleJob({}, () => {});

async function loadCronMessages(client: Client) {
    const cronMessages = await getCronMessages();
    for (const cronMsg of cronMessages) {
        createCronMessageCronJob(client, cronMsg.CREATOR_ID, cronMsg.CHANNEL_ID, cronMsg.MESSAGE, JSON.parse(cronMsg.CRON_RULE) as CronRule, {id: cronMsg.ID, mentionable: cronMsg.MENTIONABLE});
    }
}

export { createCronMessageCronJob, loadCronMessages };