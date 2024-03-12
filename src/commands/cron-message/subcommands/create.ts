/* eslint-disable @typescript-eslint/no-base-to-string */
import { insertCronMessage } from '../../../sql/tables/cron_message';
import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { DayChoices, emptyEmbedFieldInline } from '../../../util/discordUtil';
import { CronRule } from '../../../cronjobs';
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
    const cronRule: CronRule = {second, minute, hour, tz};

    const dayOfWeek = interaction.options.getInteger('day_of_week');
    if (dayOfWeek) {
        cronRule.dayOfWeek = dayOfWeek;
    }

    if (channel && message && cronRule) {
        
        if (mentionable) {
            const id = createCronMessageCronJob(interaction.client, interaction.user.id, channel.id, message, cronRule, mentionable ? {mentionable: mentionable.toString()}: {});
            await insertCronMessage(id, interaction.user.id, channel.id, message, JSON.stringify(cronRule), mentionable.toString());
        }
        
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