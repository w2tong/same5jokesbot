import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import check from './subcommands/check';
import goods from './subcommands/display-goods';
import steal from './subcommands/steal';
import info from './subcommands/info';

const subcommands = {
    [check.name]: check.execute,
    [goods.name]: goods.execute,
    [steal.name]: steal.execute,
    [info.name]: info.execute
};

async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await subcommands[subcommand](interaction);
}

const name = 'steal';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Steal points from other users.')
    .addSubcommand(check.subcommandBuilder)
    .addSubcommand(goods.subcommandBuilder)
    .addSubcommand(steal.subcommandBuilder)
    .addSubcommand(info.subcommandBuilder);

export default { execute, name, commandBuilder };