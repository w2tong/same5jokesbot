import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { generateTopProfitsEmbed } from '../../../util/discordUtil';
import { ProfitType } from '../../../sql/tables/profits';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    void interaction.editReply(await generateTopProfitsEmbed(ProfitType.Gamble));
}

const name = 'top-profits';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Gets cringe point top gamble profits.');

export default { execute, name, subcommandBuilder };