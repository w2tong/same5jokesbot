import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import duel from './subcommands/duel';
import getTopDeathrollProfits from './subcommands/top-profits';

const subcommands = {
    [duel.name]: duel.execute,
    [getTopDeathrollProfits.name]: getTopDeathrollProfits.execute,
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
    .addSubcommand(getTopDeathrollProfits.subcommandBuilder);

export default { execute, name, commandBuilder };