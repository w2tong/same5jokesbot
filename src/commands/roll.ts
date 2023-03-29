import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import logger from '../logger';

function execute(interaction: ChatInputCommandInteraction) {
    const min = interaction.options.getInteger('min') ?? 1;
    const max = interaction.options.getInteger('max') ?? 100;
    interaction.reply(Math.floor(Math.random() * (max + 1 - min) + min).toString()).catch((err: Error) => logger.error({
        message: err.message,
        stack: err.stack
    }));
}

const name = 'roll';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Rolls a random number from 1 to 100 (or min and max)')
    .addIntegerOption((option) => option.setName('min').setDescription('Enter an integer'))
    .addIntegerOption((option) => option.setName('max').setDescription('Enter an integer'));

export default { execute, name, commandBuilder };