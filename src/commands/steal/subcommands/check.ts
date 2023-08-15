import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { getUserCringePoints } from '../../../sql/tables/cringe-points';
import { stealPcMax } from '../stealManager';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const user = interaction.options.getUser('user');
    if (!user) {
        void interaction.editReply('There was an error getting the user.');
        return;
    }
    const points = await getUserCringePoints(user.id) ?? 0;
    void interaction.editReply(`You can steal a max of ${points * stealPcMax} points from ${user}`);
}

const name = 'check';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Check the number of points you can steal from a user.')
    .addUserOption((option) => option.setName('user').setDescription('Select a user').setRequired(true));

export default { execute, name, subcommandBuilder };