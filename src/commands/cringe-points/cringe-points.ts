import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import getCringePoints from './subcommands/get-cringe-points';
import getTopCringePoints from './subcommands/get-top-cringe-points';
import gambleCringePoints from './subcommands/gamble-cringe-points';
import giveCringePoints from './subcommands/give-cringe-points';

const subcommands = {
    [getCringePoints.name]: getCringePoints.execute,
    [getTopCringePoints.name]: getTopCringePoints.execute,
    [gambleCringePoints.name]: gambleCringePoints.execute,
    [giveCringePoints.name]: giveCringePoints.execute
};

async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await subcommands[subcommand](interaction);
}

const name = 'cringe-points';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Get or gamble Cringe points.')
    .addSubcommand(getCringePoints.subcommandBuilder)
    .addSubcommand(getTopCringePoints.subcommandBuilder)
    .addSubcommand(gambleCringePoints.subcommandBuilder)
    .addSubcommand(giveCringePoints.subcommandBuilder);

export default { execute, name, commandBuilder };