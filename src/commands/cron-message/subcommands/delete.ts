/* eslint-disable @typescript-eslint/no-base-to-string */
import { AutocompleteInteraction, ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder, userMention } from 'discord.js';
import schedule from 'node-schedule';
import { cronMessageJobs } from '../cronMessageManager';
import { DayChoices } from '../../../util/discordUtil';
import { deleteCronMessage } from '../../../sql/tables/cron_message';
import { logError } from '../../../logger';

function cronRuleToString(rule: schedule.RecurrenceSpecObjLit) {
    const hour = rule.hour ? Number(rule.hour.toString()) : 0;
    const minute = rule.minute ? Number(rule.minute.toString()) : 0;
    const second = rule.second ? Number(rule.second.toString()) : 0;
    const dayOfWeek = rule.dayOfWeek;
    const tz = rule.tz;

    return (dayOfWeek ? `${DayChoices[parseInt(dayOfWeek.toString())-1].name.slice(0,3)} ` : '') + `${hour < 10 ? `0${hour}` : hour}:${minute < 10 ? `0${minute}` : minute}:${second < 10 ? `0${second}` : second} ${tz}`;
}

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const id = interaction.options.getString('message');

    try {
        if (!id) {
            void interaction.editReply('Could not find cron message');
            return;
        }
    
        const job = cronMessageJobs[id];
        const embed = new EmbedBuilder()
            .setTitle('Cron message deleted')
            .addFields(
                {name: 'Creator', value: userMention(job.creatorId), inline: true},
                {name: 'Time', value: cronRuleToString(JSON.parse(job.rule) as schedule.RecurrenceSpecObjLit), inline: true},
                {name: 'Message', value: job.message}
            )
            ;
    
        await deleteCronMessage(id);
        job.job.cancel();
        delete cronMessageJobs[id];
        void interaction.editReply({embeds: [embed]});
    }
    catch(err) {
        void interaction.editReply('There was an error deleting the cron message');
        logError(err);
    }
}

async function autocomplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused();
    const choices = [];
    for (const [id, job] of Object.entries(cronMessageJobs)) {
        choices.push({id, creatorId: job.creatorId, creatorUsername: job.creatorUsername, guildId: job.guildId, message: job.message, rule: job.rule});
    }
    const filtered = choices.filter(job => job.creatorId === interaction.user.id && job.message.includes(focusedValue));
    await interaction.respond(
        filtered.map(choice => ({ name: `${choice.creatorUsername} - [${cronRuleToString(JSON.parse(choice.rule) as schedule.RecurrenceSpecObjLit)}]: ${choice.message}`.trim().slice(0, 100), value: choice.id })),
    );
}

const name = 'delete';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Delete a cron message.')
    .addStringOption(option => option
        .setName('message')
        .setDescription('Message to search for.')
        .setRequired(true)
        .setAutocomplete(true)
    );

export default { execute, autocomplete, name, subcommandBuilder };