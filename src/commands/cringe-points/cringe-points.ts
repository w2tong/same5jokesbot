import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import getCringePoints from './subcommands/get-cringe-points';
import getTopCringePoints from './subcommands/get-top-cringe-points';

const subcommands = {
    [getCringePoints.name]: getCringePoints.execute,
    [getTopCringePoints.name]: getTopCringePoints.execute
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
    .addSubcommand(getTopCringePoints.subcommandBuilder);

export default { execute, name, commandBuilder };