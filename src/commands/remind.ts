import { ChannelType, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { newReminder } from '../reminders';
import logger from '../logger';
import parseDate from '../parse-date';
import { getTimestampEST } from '../util';

async function execute(interaction: ChatInputCommandInteraction) {
    const mention = interaction.options.getMentionable('mention');
    const msg = interaction.options.getString('message');
    const time = interaction.options.getNumber('time');
    const timeUnit = interaction.options.getString('time-unit');
    const message = `${mention} ${msg}`;
    
    let reply = 'Error creating reminder.';
    if (interaction.channel && interaction.channel.type === ChannelType.GuildText && time && timeUnit) {
        const date = parseDate(time, timeUnit);
        try {
            await newReminder(interaction.channel, date, message);
            const embed = new EmbedBuilder()
                .setTitle('Reminder')
                .addFields(
                    { name: 'Time', value: `${getTimestampEST(date)}` },
                    { name: 'Message', value: `${message}` }
                );
            interaction.reply({embeds: [embed]}).catch((err: Error) => logger.error({
                message: err.message,
                stack: err.stack
            }));
            return;
        } catch (err){
            reply += `\n${err}`;
        }
    }
    interaction.reply({content: reply, ephemeral: true}).catch((err: Error) => logger.error({
        message: err.message,
        stack: err.stack
    }));
}

const name = 'remind';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Set a reminder to mention someone with a message.')
    .addMentionableOption((option) => option.setName('mention').setDescription('Select user or role.').setRequired(true))
    .addNumberOption((option) => option.setName('time').setDescription('Amount of time. Must be greater than 0.').setRequired(true).setMinValue(0.1))
    .addStringOption((option) => option.setName('time-unit').setDescription('Time unit (eg. seconds, minutes, hours).').setRequired(true).addChoices(
        {name: 'minutes', value: 'minute'},
        {name: 'hours', value: 'hour'},
        {name: 'days', value: 'day'}
    ))
    .addStringOption((option) => option.setName('message').setDescription('Message').setRequired(true));

export default { execute, name, commandBuilder };