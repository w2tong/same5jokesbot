import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import spin from './subcommands/spin';
import info from './subcommands/info';
import getSlotsProfits from './subcommands/profits';
import getTopSlotsProfits from './subcommands/top-profits';

const subcommands = {
    [spin.name]: spin.execute,
    [info.name]: info.execute,
    [getSlotsProfits.name]: getSlotsProfits.execute,
    [getTopSlotsProfits.name]: getTopSlotsProfits.execute,
};

async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await subcommands[subcommand](interaction);
}

const name = 'slots';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Spin the slot machine or get your stats.')
    .addSubcommand(spin.subcommandBuilder)
    .addSubcommand(info.subcommandBuilder)
    .addSubcommand(getSlotsProfits.subcommandBuilder)
    .addSubcommand(getTopSlotsProfits.subcommandBuilder);

export default { execute, name, commandBuilder };