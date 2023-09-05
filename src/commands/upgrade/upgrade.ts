import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import steal from './subcommands/steal';

const subcommands = {
    [steal.name]: steal.execute,
};

async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await subcommands[subcommand](interaction);
}

const name = 'upgrade';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('PH.')
    .addSubcommand(steal.subcommandBuilder);

export default { execute, name, commandBuilder };