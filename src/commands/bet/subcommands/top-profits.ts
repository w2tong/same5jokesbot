import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { ProfitType } from '../../../sql/tables/profits';
import { generateTopProfitsEmbed } from '../../../util/discordUtil';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    void interaction.editReply(await generateTopProfitsEmbed(ProfitType.Bet));
}

const name = 'top-profits';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Gets cringe point top betting profits.');

export default { execute, name, subcommandBuilder };