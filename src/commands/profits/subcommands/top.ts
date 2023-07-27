import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { generateTopProfitsEmbed } from '../../../util/discordUtil';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    void interaction.editReply(await generateTopProfitsEmbed());
}

const name = 'top';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Gets top total profits.');

export default { execute, name, subcommandBuilder };