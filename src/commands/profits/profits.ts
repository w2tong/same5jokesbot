import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import get from './subcommands/get';
import top from './subcommands/top';

const subcommands = {
    [get.name]: get.execute,
    [top.name]: top.execute,
};

async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await subcommands[subcommand](interaction);
}

const name = 'profits';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Get profits across all activities.')
    .addSubcommand(get.subcommandBuilder)
    .addSubcommand(top.subcommandBuilder);

export default { execute, name, commandBuilder };