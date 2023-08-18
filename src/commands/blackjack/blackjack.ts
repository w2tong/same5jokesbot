import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import Blackjack from './blackjackManager';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ephemeral: true});
    const blackjack = new Blackjack(interaction.user.id);
    await interaction.editReply('this does nothing');
}

const name = 'blackjack';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Start a blackjack game.')
    .addIntegerOption((option) => option
        .setName('amount')
        .setDescription('Enter the amount of points to wager.')
        .setRequired(true)
    );

export default { execute, name, commandBuilder };