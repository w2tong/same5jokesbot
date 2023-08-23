import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { newSteal, stealPcMax, stealMax } from '../stealManager';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount') ?? 0;
    if (!user) {
        void interaction.editReply('There was an error stealing.');
        return;
    }
    if (user.bot) {
        void interaction.editReply('You cannot steal from bots.');
        return;
    }
    void interaction.editReply(await newSteal(interaction.user.id, interaction.user.username, user.id, user.username, amount));
}

const name = 'steal';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription(`Steal points from another user. Number of points cannot exceed ${stealPcMax * 100}% of the user's points or ${stealMax}.`)
    .addUserOption((option) => option
        .setName('user')
        .setDescription('Select a user')
        .setRequired(true)
    )
    .addIntegerOption((option) => option
        .setName('amount')
        .setDescription('Number of points to steal')
        .setMinValue(1)
    );

export default { execute, name, subcommandBuilder };