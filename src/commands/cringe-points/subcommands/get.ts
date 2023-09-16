import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder, bold } from 'discord.js';
import { getUserCringePoints } from '../../../sql/tables/cringe_points';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const user = interaction.options.getUser('user') ?? interaction.user;
    const cringePoints = await getUserCringePoints(user.id) ?? 0;
    void interaction.editReply(`${user} has ${bold(cringePoints.toLocaleString())} points.`);
}

const name = 'get';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Gets a user\'s Cringe points.')
    .addUserOption((option) => option.setName('user').setDescription('Select a user.'));

export default { execute, name, subcommandBuilder };