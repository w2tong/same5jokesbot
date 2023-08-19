import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import BlackjackGame from './blackjackManager';
import { nanoid } from 'nanoid';

const maxWager = 1_000_000;

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ephemeral: true});
    const wager = interaction.options.getInteger('wager');
    if (!wager) {
        await interaction.editReply('There was an error getting your wager');
        return;
    }
    const blackjack = new BlackjackGame(interaction.user.id, interaction.user.username, wager);

    const hitButtonId = `hit-${nanoid()}`;
    const standButtonId = `stand-${nanoid()}`;
    const doubleButtonId = `double-${nanoid()}`;
    const buttonsRow = new ActionRowBuilder<ButtonBuilder>();
    buttonsRow.addComponents(
        new ButtonBuilder()
            .setCustomId(hitButtonId)
            .setLabel('Roll')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId(standButtonId)
            .setLabel('Stand')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId(doubleButtonId)
            .setLabel('Double Down')
            .setStyle(ButtonStyle.Primary)
    );

    await interaction.editReply({embeds: [blackjack.createEmbed()], components: [buttonsRow]});
}

const name = 'blackjack';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Start a blackjack game.')
    .addIntegerOption((option) => option
        .setName('wager')
        .setDescription('Enter the amount of points to wager.')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(maxWager)
    );

export default { execute, name, commandBuilder };