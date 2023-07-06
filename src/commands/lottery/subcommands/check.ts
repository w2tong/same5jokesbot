import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import lotteryManager from '../lotteryManager';

async function execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.user;
    await interaction.deferReply();
    const check = await lotteryManager.checkTickets(user.id, interaction.client.users);
    if (check instanceof EmbedBuilder) await interaction.editReply({embeds: [check]});
    else await interaction.editReply(check);
}

const name = 'check';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Check your tickets for the current lottery.');

export default { execute, name, subcommandBuilder };