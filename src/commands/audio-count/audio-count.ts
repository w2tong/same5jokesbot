import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import getAudioCount from './subcommands/get';
import getTotalAudioCount from './subcommands/total';

const subcommands = {
    [getAudioCount.name]: getAudioCount.execute,
    [getTotalAudioCount.name]: getTotalAudioCount.execute
};

async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await subcommands[subcommand](interaction);
}

const name = 'audio-count';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Create a bar chart of a user\'s audio count or total audio count.')
    .addSubcommand(getAudioCount.subcommandBuilder)
    .addSubcommand(getTotalAudioCount.subcommandBuilder);

export default { execute, name, commandBuilder };