import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, ComponentType, EmbedBuilder, SlashCommandSubcommandBuilder, bold, time } from 'discord.js';
import { getUserReminders } from '../../../sql/tables/reminders';
import { logError } from '../../../logger';
import { nanoid } from 'nanoid';
import { cancelReminder } from '../reminderManager';
import { timeInMS } from '../../../util/util';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ephemeral: true});
    const userId = interaction.user.id;
    const reminders = await getUserReminders(userId);
    const embeds: EmbedBuilder[] = [];
    const row = new ActionRowBuilder<ButtonBuilder>();
    const deleteCustomId = `delete-${nanoid()}`;
    for (let i = 0; i < reminders.length; i++) {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`${deleteCustomId}-${i+1}`)
                .setLabel(`Delete Reminder ${i+1}`)
                .setStyle(ButtonStyle.Danger),
        );
        const date = new Date(`${reminders[i].TIME} UTC`);
        const embed = new EmbedBuilder()
            .setTitle(`Reminder ${i+1}`)
            .addFields(
                { name: 'Time', value: `${time(date)} ${time(date, 'R')}` },
                { name: 'Message', value: `${reminders[i].MESSAGE}` }
            );
        embeds.push(embed);
    }
    if (embeds.length !== 0 && row) {
        const reply = await interaction.editReply({embeds, components: [row]});
    
        const buttonFilter = (i: ButtonInteraction) => i.user.id === userId;
        const collector = reply.createMessageComponentCollector({ componentType: ComponentType.Button, time: 5 * timeInMS.minute, filter: buttonFilter });
        collector.on('collect', async i => {
            if (i.user.id === interaction.user.id) {
                const num = parseInt(i.customId[i.customId.length-1])-1;
                if (await cancelReminder(reminders[num].ID) === true) {
                    i.update({ content: `Reminder ${bold(`${num+1}`)} deleted.`, components: [], embeds: embeds.slice(num,num+1) }).catch(logError);
                }
                else {
                    i.update({ content: 'Error deleting reminder.', components: [], embeds: [] }).catch(logError);
                }
            }
            collector.stop();
        });
        
        collector.on('end', collected => {
            if (collected.size === 0) {
                // can't delete ephemeral messages
                // void interaction.deleteReply();
            }
        });
        
    }
    else {
        void interaction.editReply('You have no reminders to delete.');
    }
}

const name = 'delete';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Select a reminder to delete.');

export default { execute, name, subcommandBuilder };