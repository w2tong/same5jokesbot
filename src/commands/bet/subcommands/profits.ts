import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { ProfitType } from '../../../sql/tables/profits';
import { generateUserProfitsResponse } from '../../../util/discordUtil';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const user = interaction.options.getUser('user') ?? interaction.user;
    void interaction.editReply(await generateUserProfitsResponse(user.id, user.username, ProfitType.Bet));
}

const name = 'profits';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Gets a user\'s betting profits.')
    .addUserOption((option) => option.setName('user').setDescription('Select a user'));

export default { execute, name, subcommandBuilder };