import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder, userMention } from 'discord.js';
import { calculateDailyTax } from '../../../taxes-welfare';
import { getUserCringePoints } from '../../../sql/tables/cringe-points';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const userId = (interaction.options.getUser('user') ?? interaction.user).id;
    const points = await getUserCringePoints(userId);
    const res = points ? `${userMention(userId)}'s Daily Taxes: ${calculateDailyTax(points).toLocaleString()}` : 'There was an error calculating your taxes';
    await interaction.editReply(res);
}

const name = 'daily';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Get daily taxes owed.')
    .addUserOption((option) => option.setName('user').setDescription('Select a user'));

export default { execute, name, subcommandBuilder };