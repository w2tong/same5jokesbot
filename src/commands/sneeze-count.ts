import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getSneezeCount } from '../sql/tables/sneeze-count';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    let sneezes = 0;
    const sneezeCount = await getSneezeCount(interaction.user.id);
    if (sneezeCount) {
        sneezes = sneezeCount.COUNT;
    }
    void interaction.editReply(`**${sneezes}** sneezes.`);
}

const name = 'sneeze-count';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Gets your sneeze count.');

export default { execute, name, commandBuilder };