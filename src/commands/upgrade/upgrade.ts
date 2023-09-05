import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import steal from './subcommands/steal';
import info from './subcommands/info';
import display from './subcommands/display';

const subcommands = {
    [steal.name]: steal.execute,
    [info.name]: info.execute,
    [display.name]: display.execute,
};

async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await subcommands[subcommand](interaction);
}

const name = 'upgrade';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Get upgrades or get info about upgrades.')
    .addSubcommand(steal.subcommandBuilder)
    .addSubcommand(info.subcommandBuilder)
    .addSubcommand(display.subcommandBuilder);

export default { execute, name, commandBuilder };