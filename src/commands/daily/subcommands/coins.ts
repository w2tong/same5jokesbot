import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder, bold } from 'discord.js';
import { getDailyCoins } from '../../../sql/tables/daily_coins';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const user = interaction.options.getUser('user') ?? interaction.user;
    const cringePoints = await getDailyCoins(user.id) ?? 0;
    void interaction.editReply(`${user} has ${bold(cringePoints.toLocaleString())} coins.`);
}

const name = 'coins';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Gets a user\'s daily coins.')
    .addUserOption((option) => option.setName('user').setDescription('Select a user.'));

export default { execute, name, subcommandBuilder };