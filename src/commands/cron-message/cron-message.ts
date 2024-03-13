import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import createCronMessage from './subcommands/create';
import deleteCronMessage from './subcommands/delete';

const subcommandExecute = {
    [createCronMessage.name]: createCronMessage.execute,
    [deleteCronMessage.name]: deleteCronMessage.execute,
};
const subcommandAutocomplete = {
    [deleteCronMessage.name]: deleteCronMessage.autocomplete,
};

async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await subcommandExecute[subcommand](interaction);
}

async function autocomplete(interaction: AutocompleteInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await subcommandAutocomplete[subcommand](interaction);
}

const name = 'cron-message';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Manage cron mesages.')
    .addSubcommand(createCronMessage.subcommandBuilder)
    .addSubcommand(deleteCronMessage.subcommandBuilder);

export default { execute, autocomplete, name, commandBuilder };