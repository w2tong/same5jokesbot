import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { newSteal } from '../stealManager';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    if (user && amount) {
        await newSteal(interaction.user.id, user.id, amount);
        void interaction.editReply('embed here');
    }
    else {
        void interaction.editReply('There was an error stealing.');
    }
    
}

const name = 'steal';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription(`Steal points from another user. Number of points cannot exceed ${0.5}% of the user's points.`)
    .addUserOption((option) => option
        .setName('user')
        .setDescription('Select a user')
        .setRequired(true)
    )
    .addIntegerOption((option) => option
        .setName('amount')
        .setDescription('Number of points to steal')
        .setRequired(true)
    );

export default { execute, name, subcommandBuilder };