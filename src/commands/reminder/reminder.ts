import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import createReminder from './subcommands/create';
import deleteReminder from './subcommands/delete';

const subcommands = {
    [createReminder.name]: createReminder.execute,
    [deleteReminder.name]: deleteReminder.execute,
};

async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await subcommands[subcommand](interaction);
}

const name = 'reminder';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Create or delete reminders.')
    .addSubcommand(createReminder.subcommandBuilder)
    .addSubcommand(deleteReminder.subcommandBuilder);

export default { execute, name, commandBuilder };