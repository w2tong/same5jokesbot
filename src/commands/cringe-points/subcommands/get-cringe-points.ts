import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { getUserCringePoints } from '../../../sql/cringe-points';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const user = interaction.options.getUser('user') ?? interaction.user;
    let points = 0;
    const cringePoints = await getUserCringePoints(user.id);
    if (cringePoints) {
        points = cringePoints;
    }
    void interaction.editReply(`**${user.username}** has **${points}** points.`);
}

const name = 'get';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Gets a user\'s cringe points.')
    .addUserOption((option) => option.setName('user').setDescription('Select a user'));

export default { execute, name, subcommandBuilder };