import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { generateTopProfitsEmbed } from '../../../util/discordUtil';
import { ProfitType } from '../../../sql/tables/profits';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    void interaction.editReply(await generateTopProfitsEmbed(ProfitType.Lottery));
}

const name = 'top-profits';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Gets top lottery profits.');

export default { execute, name, subcommandBuilder };