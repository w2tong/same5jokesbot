import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import getTimeInVoice from './subcommands/get';
import getTimeInVoiceLineGraph from './subcommands/line-graph';
import getTimeInVoiceTogether from './subcommands/together';
import getTopTimeInVoice from './subcommands/top';

const subcommands = {
    [getTimeInVoice.name]: getTimeInVoice.execute,
    [getTimeInVoiceLineGraph.name]: getTimeInVoiceLineGraph.execute,
    [getTimeInVoiceTogether.name]: getTimeInVoiceTogether.execute,
    [getTopTimeInVoice.name]: getTopTimeInVoice.execute
};

async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await subcommands[subcommand](interaction);
}

const name = 'time-in-voice';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Get info about users\' time in voice.')
    .addSubcommand(getTimeInVoice.subcommandBuilder)
    .addSubcommand(getTimeInVoiceLineGraph.subcommandBuilder)
    .addSubcommand(getTimeInVoiceTogether.subcommandBuilder)
    .addSubcommand(getTopTimeInVoice.subcommandBuilder);

export default { execute, name, commandBuilder };