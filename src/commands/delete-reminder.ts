import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import logger from '../logger';
import { getTimestampEST } from '../util';
import { deleteReminder, getUserReminders } from '../sql/reminders';

async function execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    const reminders = await getUserReminders(userId);
    const embeds: Array<EmbedBuilder> = [];
    const row = new ActionRowBuilder<ButtonBuilder>();
    for (let i = 0; i < reminders.length; i++) {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId((i+1).toString())
                .setLabel(`Delete Reminder ${i+1}`)
                .setStyle(ButtonStyle.Danger),
        );
        const embed = new EmbedBuilder()
            .setTitle(`Reminder ${i+1}`)
            .addFields(
                { name: 'Time', value: `${getTimestampEST(new Date(reminders[i].TIME))}` },
                { name: 'Message', value: `${reminders[i].MESSAGE}` }
            );
        embeds.push(embed);
    }
    if (embeds.length !== 0 && row) {
        interaction.reply({embeds, components: [row], ephemeral: true}).catch((err: Error) => logger.error({
            message: err.message,
            stack: err.stack
        }));
    }
    else {
        interaction.reply({content: 'You have no reminders to delete.', ephemeral: true}).catch((err: Error) => logger.error({
            message: err.message,
            stack: err.stack
        }));
    }

    
    if (interaction.channel) {
        
        const collector = interaction.channel.createMessageComponentCollector({ componentType: ComponentType.Button, time: 30000 });

        collector.on('collect', async i => {
            if (i.user.id === interaction.user.id) {
                const num = parseInt(i.customId)-1;
                try {
                    await deleteReminder(reminders[num].ID);
                    i.update({ content: `Reminder ${i.customId} deleted.`, components: [], embeds: embeds.slice(num,num+1) }).catch((err: Error) => logger.error({
                        message: err.message,
                        stack: err.stack
                    }));
                }
                catch {
                    i.update({ content: 'Error deleting reminder.', components: [], embeds: [] }).catch((err: Error) => logger.error({
                        message: err.message,
                        stack: err.stack
                    }));
                }
            }
            collector.stop();
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.deleteReply().catch((err: Error) => logger.error({
                    message: err.message,
                    stack: err.stack
                }));
            }
        });
    }
}

const name = 'delete-reminder';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Choose to delete your reminders.');

export default { execute, name, commandBuilder };