import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import autoBattler from './subcommands/auto-battler';
import steal from './subcommands/steal';
import info from './subcommands/info';
import display from './subcommands/display';

const subcommands = {
    [autoBattler.name]: autoBattler.execute,
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
    .addSubcommand(autoBattler.subcommandBuilder)
    .addSubcommand(steal.subcommandBuilder)
    .addSubcommand(info.subcommandBuilder)
    .addSubcommand(display.subcommandBuilder);

export default { execute, name, commandBuilder };