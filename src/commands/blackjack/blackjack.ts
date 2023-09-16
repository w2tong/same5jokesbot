import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, ComponentType, SlashCommandBuilder } from 'discord.js';
import BlackjackGame, { PlayerOption, PlayerOptions, maxDecks, maxWager } from './BlackjackGame';
import { getUserCringePoints } from '../../sql/tables/cringe_points';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const user = interaction.user;
    const res = await interaction.fetchReply();
    if (!interaction.channel) {
        await interaction.editReply('There was an error creating the blackjack game.');
        return;
    }
    const wager = interaction.options.getInteger('wager');
    if (!wager) {
        await interaction.editReply('There was an error getting your wager');
        return;
    }

    const numOfDecks = interaction.options.getInteger('decks') ?? 1;

    const balance = await getUserCringePoints(user.id) ?? 0;
    if (balance < wager) {
        await interaction.editReply(`You do not have enough points (Balance: ${balance.toLocaleString()}).`);
        return;
    }

    const blackjack = new BlackjackGame(user, numOfDecks, wager, balance, interaction.client, interaction.channelId);
    await blackjack.startGame();
    if (blackjack.isEnded()) {
        await interaction.editReply({embeds: [blackjack.createEmbed()]});
        return;
    }

    const hitButton = new ButtonBuilder()
        .setCustomId(PlayerOptions.Hit)
        .setLabel('Hit')
        .setStyle(ButtonStyle.Success);
    const standButton = new ButtonBuilder()
        .setCustomId(PlayerOptions.Stand)
        .setLabel('Stand')
        .setStyle(ButtonStyle.Danger);
    const doubleButton = new ButtonBuilder()
        .setCustomId(PlayerOptions.Double)
        .setLabel('Double Down')
        .setStyle(ButtonStyle.Primary);
    // const splitButton = new ButtonBuilder()
    //     .setCustomId(PlayerOptions.Split)
    //     .setLabel('Split')
    //     .setStyle(ButtonStyle.Secondary);

    const firstTurnButtonsRow = new ActionRowBuilder<ButtonBuilder>();
    firstTurnButtonsRow.addComponents(hitButton, standButton, doubleButton);
    // if (blackjack.splitable()) firstTurnButtonsRow.addComponents(splitButton);

    const buttonsRow = new ActionRowBuilder<ButtonBuilder>();
    buttonsRow.addComponents(hitButton, standButton);

    await interaction.editReply({embeds: [blackjack.createEmbed()], components: [firstTurnButtonsRow]});

    const buttonFilter = async (i: ButtonInteraction) => {
        if (user.id !== i.user.id) {
            await i.reply({content: 'You are not in this blackjack game.', ephemeral: true});
            return false;
        }
        return true;
    };

    const buttonCollector = res.createMessageComponentCollector({ componentType: ComponentType.Button, time: BlackjackGame.idleTimeout, filter: buttonFilter });

    buttonCollector.on('collect', async buttonInteraction => {
        buttonCollector.resetTimer();
        const input = await blackjack.input(buttonInteraction.customId as PlayerOption);
        // if (buttonInteraction.customId.split('-')[0] === 'Split') {
        //     void execute(interaction);
        // }
        if (input.valid) {
            await buttonInteraction.update({embeds: [blackjack.createEmbed()], components: [buttonsRow]});
            if (blackjack.isEnded()) buttonCollector.stop();
        }
        else {
            await buttonInteraction.reply({content: input.msg ?? 'That action is invalid.', ephemeral: true});
        }
    });

    buttonCollector.on('end', async () => {
        if (!blackjack.isEnded()) {
            await blackjack.input('Stand');
        }
        await res.edit({embeds: [blackjack.createEmbed()], components: []});
    });
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
    )
    .addIntegerOption((option) => option
        .setName('decks')
        .setDescription('Enter the number of decks to play with.')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(maxDecks)
    );

export default { execute, name, commandBuilder };