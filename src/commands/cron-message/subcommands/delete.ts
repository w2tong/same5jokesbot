import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    // TODO: functionality
    void interaction.editReply('Cron message deleted.');
}

const name = 'delete';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Delete a cron message.');

export default { execute, name, subcommandBuilder };