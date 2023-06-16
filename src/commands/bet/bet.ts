import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import createBet from './subcommands/create-bet';
import deleteBet from './subcommands/delete-bet';
import endBetting from './subcommands/end-betting';
import resolveBet from './subcommands/resolve-bet';

const subcommands = {
    [createBet.name]: createBet.execute,
    [deleteBet.name]: deleteBet.execute,
    [endBetting.name]: endBetting.execute,
    [resolveBet.name]: resolveBet.execute,
};

async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await subcommands[subcommand](interaction);
}

const name = 'bet';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Create, delete, resolve, or end betting.')
    .addSubcommand(createBet.subcommandBuilder)
    .addSubcommand(deleteBet.subcommandBuilder)
    .addSubcommand(endBetting.subcommandBuilder)
    .addSubcommand(resolveBet.subcommandBuilder);

export default { execute, name, commandBuilder };