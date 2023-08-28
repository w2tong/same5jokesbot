import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    await interaction.editReply('today\'s dailies');
}

const name = 'daily';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Check your progress on today\'s dailies.');

export default { execute, name, commandBuilder };