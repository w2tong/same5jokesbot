import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { displayStolenGoods } from '../stealManager';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    void interaction.editReply(displayStolenGoods(interaction.user));
}

const name = 'display-goods';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Display your stolen goods.');

export default { execute, name, subcommandBuilder };