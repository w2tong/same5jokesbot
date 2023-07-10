import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { createLotteryInfoEmbed } from '../lotteryManager';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const infoEmbed = await createLotteryInfoEmbed();
    await interaction.editReply({embeds: [infoEmbed]});
}

const name = 'info';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Get info about the lottery.');

export default { execute, name, subcommandBuilder };