import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import gambleCringePoints from './subcommands/gamble';

const subcommands = {
    [gambleCringePoints.name]: gambleCringePoints.execute,
};

async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await subcommands[subcommand](interaction);
}

const name = 'gamble';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Gamble Cringe points or get info about your profits.')
    .addSubcommand(gambleCringePoints.subcommandBuilder);

export default { execute, name, commandBuilder };