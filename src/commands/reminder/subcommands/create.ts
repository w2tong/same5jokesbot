import { ChannelType, ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder, time } from 'discord.js';
import * as chrono from 'chrono-node';
import { newReminder } from '../reminderManager';
import { getUserRemindersCount } from '../../../sql/tables/reminders';

const MAX_REMINDERS = 5;

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const mention = interaction.options.getMentionable('mention');
    const msg = interaction.options.getString('message');
    const date = interaction.options.getString('date');
    const message = `${mention} ${msg} (sent by ${interaction.user.username})`;
    
    const count = await getUserRemindersCount(interaction.user.id);
    let reply = 'Error creating reminder.';
    if (count >= MAX_REMINDERS) {
        reply += `\nMax number of reminders is ${MAX_REMINDERS}.`;
    }
    else if (interaction.channel && interaction.channel.type === ChannelType.GuildText && date) {
        const dateStr = chrono.parseDate(date, {timezone: 'ET'});
        if (dateStr) {
            const date = new Date(dateStr);
            const dateNow = new Date();
            if (date > dateNow) {
                if (await newReminder(interaction.user.id ,interaction.channel, date, message) === true) {
                    const embed = new EmbedBuilder()
                        .setTitle('Reminder')
                        .addFields(
                            { name: 'Time', value: `${time(date)} ${time(date, 'R')}` },
                            { name: 'Message', value: `${message}` }
                        );
                    void interaction.editReply({embeds: [embed]});
                    return;
                }
            }
            else {
                void interaction.editReply('Date/time must be in the future.');
            }
        }
        else {
            void interaction.editReply(`Invalid time/date input: \`${time}\``);
        }
        
    }
    else {
        void interaction.editReply(reply);
    }
}

const name = 'create';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Set a reminder to mention someone with a message.')
    .addMentionableOption((option) => option.setName('mention').setDescription('Select user or role.').setRequired(true))
    .addStringOption((option) => option.setName('date').setDescription('Enter a time or date (e.g. "in 5 minutes" or "friday at 5pm")').setRequired(true))
    .addStringOption((option) => option.setName('message').setDescription('Message').setRequired(true));

export default { execute, name, subcommandBuilder };