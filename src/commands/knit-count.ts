import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import logger from '../logger';
import { getKnitCount } from '../sql/oracledb';

async function execute(interaction: ChatInputCommandInteraction) {
    let knits = 0;
    const knitCount = await getKnitCount(interaction.user.id);
    if (knitCount) {
        knits = knitCount.COUNT;
    }
    interaction.reply(`**${knits}** knits.`).catch((err: Error) => logger.error({
        message: err.message,
        stack: err.stack
    }));
}

const name = 'knit-count';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Gets your knit count for this server.');

export default { execute, name, commandBuilder };