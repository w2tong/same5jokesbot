import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import logger from '../logger';
import { getSneezeCount } from '../sql/oracledb';

async function execute(interaction: ChatInputCommandInteraction) {
    let sneezes = 0;
    const sneezeCount = await getSneezeCount(interaction.user.id);
    if (sneezeCount) {
        sneezes = sneezeCount.COUNT;
    }
    interaction.reply(`**${sneezes}** sneezes.`).catch((err: Error) => logger.error({
        message: err.message,
        stack: err.stack
    }));
}

const name = 'sneeze-count';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Gets your sneeze count for this server.');

export default { execute, name, commandBuilder };