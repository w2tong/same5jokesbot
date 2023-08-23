import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import info from './subcommands/info';
import audio from './subcommands/audio';

const subcommands = {
    [info.name]: info.execute,
    [audio.name]: audio.execute,
};

async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await subcommands[subcommand](interaction);
}

const name = 'request';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Request a feature for the bot.')
    .addSubcommand(info.subcommandBuilder)
    .addSubcommand(audio.subcommandBuilder);

export default { execute, name, commandBuilder };