import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, ComponentType, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { convertDateToUnixTimestamp } from '../../../util/util';
import { deleteReminder, getUserReminders } from '../../../sql/tables/reminders';
import { logError } from '../../../logger';
import { nanoid } from 'nanoid';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ephemeral: true});
    const userId = interaction.user.id;
    const reminders = await getUserReminders(userId);
    const embeds: Array<EmbedBuilder> = [];
    const row = new ActionRowBuilder<ButtonBuilder>();
    const deleteCustomId = `delete-${nanoid()}`;
    for (let i = 0; i < reminders.length; i++) {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`${deleteCustomId}-${i+1}`)
                .setLabel(`Delete Reminder ${i+1}`)
                .setStyle(ButtonStyle.Danger),
        );
        const unixTimestamp = convertDateToUnixTimestamp(new Date(`${reminders[i].TIME} UTC`));
        const embed = new EmbedBuilder()
            .setTitle(`Reminder ${i+1}`)
            .addFields(
                { name: 'Time', value: `<t:${unixTimestamp}> <t:${unixTimestamp}:R>` },
                { name: 'Message', value: `${reminders[i].MESSAGE}` }
            );
        embeds.push(embed);
    }
    if (embeds.length !== 0 && row) {
        void interaction.editReply({embeds, components: [row]});
    
        if (interaction.channel) {
            const deleteButtonFilter = (i: ButtonInteraction) => i.customId.startsWith(deleteCustomId);
            const collector = interaction.channel.createMessageComponentCollector({ componentType: ComponentType.Button, time: 30000, filter: deleteButtonFilter });
        
            collector.on('collect', async i => {
                if (i.user.id === interaction.user.id) {
                    const num = parseInt(i.customId[i.customId.length-1])-1;
                    if (await deleteReminder(reminders[num].ID) === true) {
                        i.update({ content: `Reminder **${num+1}** deleted.`, components: [], embeds: embeds.slice(num,num+1) }).catch(logError);
                    }
                    else {
                        i.update({ content: 'Error deleting reminder.', components: [], embeds: [] }).catch(logError);
                    }
                }
                collector.stop();
            });
        
            collector.on('end', collected => {
                if (collected.size === 0) {
                    void interaction.deleteReply();
                }
            });
        }
    }
    else {
        void interaction.editReply('You have no reminders to delete.');
    }
}

const name = 'delete';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Choose to delete your reminders.');

export default { execute, name, subcommandBuilder };