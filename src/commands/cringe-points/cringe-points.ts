import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import getCringePoints from './subcommands/get';
import getTopCringePoints from './subcommands/get-top';
import gambleCringePoints from './subcommands/gamble';
import giveCringePoints from './subcommands/give';
import getGambleProfits from './subcommands/gamble-profits';
import getTopGambleProfits from './subcommands/top-gamble-profits';

const subcommands = {
    [getCringePoints.name]: getCringePoints.execute,
    [getTopCringePoints.name]: getTopCringePoints.execute,
    [gambleCringePoints.name]: gambleCringePoints.execute,
    [giveCringePoints.name]: giveCringePoints.execute,
    [getGambleProfits.name]: getGambleProfits.execute,
    [getTopGambleProfits.name]: getTopGambleProfits.execute
};

async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await subcommands[subcommand](interaction);
}

const name = 'cringe-points';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Get info about or gamble Cringe points.')
    .addSubcommand(getCringePoints.subcommandBuilder)
    .addSubcommand(getTopCringePoints.subcommandBuilder)
    .addSubcommand(gambleCringePoints.subcommandBuilder)
    .addSubcommand(giveCringePoints.subcommandBuilder)
    .addSubcommand(getGambleProfits.subcommandBuilder)
    .addSubcommand(getTopGambleProfits.subcommandBuilder);

export default { execute, name, commandBuilder };