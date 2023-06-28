import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import getGamerStats from './subcommands/get';
import getTotalGamerStats from './subcommands/total';

const subcommands = {
    [getGamerStats.name]: getGamerStats.execute,
    [getTotalGamerStats.name]: getTotalGamerStats.execute
};

async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await subcommands[subcommand](interaction);
}

const name = 'gamer-stats';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Get your or total gamer stats.')
    .addSubcommand(getGamerStats.subcommandBuilder)
    .addSubcommand(getTotalGamerStats.subcommandBuilder);

export default { execute, name, commandBuilder };