import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import createBet from './subcommands/create';
import deleteBet from './subcommands/delete';
import endBetting from './subcommands/end-betting';
import resolveBet from './subcommands/bet';
import getBetProfits from './subcommands/profits';
import getTopBetProfits from './subcommands/top-profits';

const subcommands = {
    [createBet.name]: createBet.execute,
    [deleteBet.name]: deleteBet.execute,
    [endBetting.name]: endBetting.execute,
    [resolveBet.name]: resolveBet.execute,
    [getBetProfits.name]: getBetProfits.execute,
    [getTopBetProfits.name]: getTopBetProfits.execute
};

async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await subcommands[subcommand](interaction);
}

const name = 'bet';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Create/interact with your bets or get profits from betting.')
    .addSubcommand(createBet.subcommandBuilder)
    .addSubcommand(deleteBet.subcommandBuilder)
    .addSubcommand(endBetting.subcommandBuilder)
    .addSubcommand(resolveBet.subcommandBuilder)
    .addSubcommand(getBetProfits.subcommandBuilder)
    .addSubcommand(getTopBetProfits.subcommandBuilder);

export default { execute, name, commandBuilder };