import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { displayStolenGoods } from '../stealManager';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    void interaction.editReply(displayStolenGoods(interaction.user.id, interaction.user.username));
}

const name = 'goods';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('description.');

export default { execute, name, subcommandBuilder };