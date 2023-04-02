import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getSneezeCount } from '../sql/sneeze-count';

async function execute(interaction: ChatInputCommandInteraction) {
    let sneezes = 0;
    const sneezeCount = await getSneezeCount(interaction.user.id);
    if (sneezeCount) {
        sneezes = sneezeCount.COUNT;
    }
    void interaction.reply(`**${sneezes}** sneezes.`);
}

const name = 'sneeze-count';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Gets your sneeze count.');

export default { execute, name, commandBuilder };