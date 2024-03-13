/* eslint-disable @typescript-eslint/no-base-to-string */
import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import schedule from 'node-schedule';
import { insertCronMessage } from '../../../sql/tables/cron_message';
import { DayChoices, emptyEmbedFieldInline } from '../../../util/discordUtil';
import { createCronMessageCronJob } from '../cronMessageManager';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    
    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message');
    const mentionable = interaction.options.getMentionable('mention');

    const second = interaction.options.getInteger('second') ?? 0;
    const minute = interaction.options.getInteger('minute') ?? 0;
    const hour = interaction.options.getInteger('hour') ?? 0;
    const tz = 'America/Toronto';
    const rule: schedule.RecurrenceSpecObjLit = {second, minute, hour, tz};

    const dayOfWeek = interaction.options.getInteger('day_of_week');
    if (dayOfWeek) {
        rule.dayOfWeek = dayOfWeek;
    }

    const ruleStr = JSON.stringify(rule);

    if (channel && message) {
        const id = await createCronMessageCronJob(interaction.client, interaction.user.id, interaction.guildId, channel.id, message, ruleStr, mentionable ? {mentionable: mentionable.toString()}: {});
        await insertCronMessage(id, interaction.guildId, interaction.user.id, channel.id, message, ruleStr, mentionable ? mentionable.toString() : undefined);
        
        const embed =  new EmbedBuilder()
            .setAuthor({name: `${interaction.user.username} created a cron message`, iconURL: interaction.user.displayAvatarURL()})
            .addFields(
                {name: 'Channel', value: `${channel}`, inline: true},
                {name: 'Message', value: message, inline: true},
                mentionable ? {name: 'Mention', value: mentionable.toString(), inline: true} : emptyEmbedFieldInline,
                {name: 'Time', value: `${hour < 10 ? `0${hour}` : hour}:${minute < 10 ? `0${minute}` : minute}:${second < 10 ? `0${second}` : second}`, inline: true},
                {name: 'Timezone', value: tz, inline: true}
            );
        if (dayOfWeek) embed.addFields({name: 'Day of Week', value: DayChoices[dayOfWeek-1].name, inline: true});
        void interaction.editReply({embeds: [embed]});
    }
    else {
        void interaction.editReply('There was an error creating your cron message.');
    }
}

const name = 'create';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Create a cron message.')
    .addChannelOption(option => option
        .setName('channel')
        .setDescription('Select a channel.')
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('message')
        .setDescription('Enter a message.')
        .setRequired(true)
        .setMaxLength(255)
    )
    .addIntegerOption(option => option
        .setName('hour')
        .setDescription('Enter a hour.')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(23)
    )
    .addIntegerOption(option => option
        .setName('minute')
        .setDescription('Enter a minute.')
        .setMinValue(0)
        .setMaxValue(59)
    )
    .addIntegerOption(option => option
        .setName('second')
        .setDescription('Enter a second.')
        .setMinValue(0)
        .setMaxValue(59)
    )
    .addIntegerOption(option => option
        .setName('day_of_week')
        .setDescription('Select a day of the week.')
        .addChoices(...DayChoices)
    )
    .addMentionableOption(option => option
        .setName('mention')
        .setDescription('Select a mentionable.')
    )
    ;

export default { execute, name, subcommandBuilder };