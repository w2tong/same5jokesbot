import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import spin from './subcommands/spin';
import info from './subcommands/info';

const subcommands = {
    [spin.name]: spin.execute,
    [info.name]: info.execute,
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
    .addSubcommand(info.subcommandBuilder);

export default { execute, name, commandBuilder };