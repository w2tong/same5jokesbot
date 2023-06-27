import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import gambleCringePoints from './subcommands/gamble';
import getGambleProfits from './subcommands/profits';
import getTopGambleProfits from './subcommands/top-profits';

const subcommands = {
    [gambleCringePoints.name]: gambleCringePoints.execute,
    [getGambleProfits.name]: getGambleProfits.execute,
    [getTopGambleProfits.name]: getTopGambleProfits.execute
};

async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await subcommands[subcommand](interaction);
}

const name = 'gamble';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Gamble Cringe points or get info about your profits.')
    .addSubcommand(gambleCringePoints.subcommandBuilder)
    .addSubcommand(getGambleProfits.subcommandBuilder)
    .addSubcommand(getTopGambleProfits.subcommandBuilder);

export default { execute, name, commandBuilder };