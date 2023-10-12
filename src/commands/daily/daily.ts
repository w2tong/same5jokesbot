import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import progress from './subcommands/progress';
import coins from './subcommands/coins';
import buyCoins from './subcommands/buy-coins';

const subcommands = {
    [progress.name]: progress.execute,
    [coins.name]: coins.execute,
    [buyCoins.name]: buyCoins.execute,
};

async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await subcommands[subcommand](interaction);
}

const name = 'daily';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Get info about you daily quests or coins.')
    .addSubcommand(progress.subcommandBuilder)
    .addSubcommand(coins.subcommandBuilder)
    .addSubcommand(buyCoins.subcommandBuilder);

export default { execute, name, commandBuilder };