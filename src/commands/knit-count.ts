import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getKnitCount } from '../sql/knit-count';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    let knits = 0;
    const knitCount = await getKnitCount(interaction.user.id);
    if (knitCount) {
        knits = knitCount.COUNT;
    }
    void interaction.editReply(`**${knits}** knits.`);
}

const name = 'knit-count';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Gets your knit count.');

export default { execute, name, commandBuilder };