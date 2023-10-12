import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import getCringePoints from './subcommands/get';
import getTopCringePoints from './subcommands/top';
import giveCringePoints from './subcommands/give';

const subcommands = {
    [getCringePoints.name]: getCringePoints.execute,
    [getTopCringePoints.name]: getTopCringePoints.execute,
    [giveCringePoints.name]: giveCringePoints.execute,
};

async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await subcommands[subcommand](interaction);
}

const name = 'cringe-points';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Get info about or give away Cringe points.')
    .addSubcommand(getCringePoints.subcommandBuilder)
    .addSubcommand(getTopCringePoints.subcommandBuilder)
    .addSubcommand(giveCringePoints.subcommandBuilder);

export default { execute, name, commandBuilder };