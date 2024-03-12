import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import createCronMessage from './subcommands/create';
import deleteCronMessage from './subcommands/delete';

const subcommands = {
    [createCronMessage.name]: createCronMessage.execute,
    [deleteCronMessage.name]: deleteCronMessage.execute,
};

async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await subcommands[subcommand](interaction);
}

const name = 'cron-message';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Manage cron mesages.')
    .addSubcommand(createCronMessage.subcommandBuilder)
    .addSubcommand(deleteCronMessage.subcommandBuilder);

export default { execute, name, commandBuilder };