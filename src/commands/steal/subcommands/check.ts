import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const user = interaction.options.getUser('user') ?? interaction.user;
    void interaction.editReply('reply');
}

const name = 'check';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('description.')
    .addUserOption((option) => option.setName('user').setDescription('Select a user').setRequired(true));

export default { execute, name, subcommandBuilder };