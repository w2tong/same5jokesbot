import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import duel from './subcommands/duel';
import profits from './subcommands/profits';
import topProfits from './subcommands/top-profits';

const subcommands = {
    [duel.name]: duel.execute,
    [profits.name]: profits.execute,
    [topProfits.name]: topProfits.execute,
};

async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await subcommands[subcommand](interaction);
}

const name = 'deathroll';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Deathroll another user or get your stats.')
    .addSubcommand(duel.subcommandBuilder)
    .addSubcommand(profits.subcommandBuilder)
    .addSubcommand(topProfits.subcommandBuilder);

export default { execute, name, commandBuilder };