import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, ModalActionRowComponentBuilder, ModalBuilder, SlashCommandSubcommandBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { nanoid } from 'nanoid';
import { timeInMS } from '../../../util/util';
import { createBet, deleteBet, endBet } from '../../../bets';
import { getUserCringePoints } from '../../../sql/tables/cringe-points';
import { logError } from '../../../logger';

const enum ButtonId {
    BetYes = 'bet-yes',
    BetNo = 'bet-no',
}

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const betTitle = interaction.options.getString('bet');
    const time = interaction.options.getNumber('time');
    if (!betTitle || !time || !interaction.channel) {
        void interaction.editReply('Error creating bet (invalid bet or time)');
        return;
    }
    
    const userId = interaction.user.id;
    const endTime = new Date(Date.now() + time * timeInMS.minute).getTime();
    const bet = createBet(betTitle, userId, endTime, interaction.channelId, (await interaction.fetchReply()).id);
    if (!bet) {
        void interaction.editReply('You already have an active bet.');
        return;
    }

    const buttonsRow = new ActionRowBuilder<ButtonBuilder>();
    buttonsRow.addComponents(
        new ButtonBuilder()
            .setCustomId(ButtonId.BetYes)
            .setLabel('Yes')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId(ButtonId.BetNo)
            .setLabel('No')
            .setStyle(ButtonStyle.Danger),
    );
    void interaction.editReply({embeds: [await bet.createBetEmbed(interaction.client.users)], components: [buttonsRow]});

    const buttonCollector = interaction.channel.createMessageComponentCollector({ componentType: ComponentType.Button, time: time * timeInMS.second });
    buttonCollector.on('collect', async buttonInteraction => {
        if (buttonInteraction.customId === ButtonId.BetYes && bet.isNoBetter(buttonInteraction.user.id) ||
            buttonInteraction.customId === ButtonId.BetNo && bet.isYesBetter(buttonInteraction.user.id)) {
            void buttonInteraction.reply({content: 'You cannot vote both Yes and No.', ephemeral: true});
            return;
        }

        const betYes = buttonInteraction.customId === ButtonId.BetYes;
        const pointsInput = new TextInputBuilder()
            .setCustomId('points')
            .setLabel('Points')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);
        const pointsActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(pointsInput);
        const modal = new ModalBuilder()
            .setCustomId(nanoid())
            .setTitle(`Vote ${betYes ? 'YES' : 'NO'}`)
            .setComponents(pointsActionRow);
        void buttonInteraction.showModal(modal);

        try {
            const modalSubmitInteraction = await buttonInteraction.awaitModalSubmit({ time: 60_000 });
            const user = modalSubmitInteraction.user;
            if (modalSubmitInteraction.customId !== modal.data.custom_id) return;
            if (bet.isEnded()) {
                void modalSubmitInteraction.reply({content: 'Error: The bet has ended.', ephemeral: true});
                return;
            }
            const currBetPoints = parseInt(modalSubmitInteraction.fields.getTextInputValue('points'));
            if (isNaN(currBetPoints)) {
                void modalSubmitInteraction.reply({content: 'Error: Invalid input. Enter a number.', ephemeral: true});
                return;
            }
            if (currBetPoints <= 0) {
                void modalSubmitInteraction.reply({content: 'Error: Invalid input. Enter a number greater than 0.', ephemeral: true});
                return;
            }
            const pointsAvailable = await getUserCringePoints(user.id);
            if (!pointsAvailable) {
                void modalSubmitInteraction.reply({content: 'Error: Could not retrieve your current Cringe points.', ephemeral: true});
                return;
            }
            const pointsBet = bet.getUserPointsBet(user.id);
            const pointsLeft = pointsAvailable - pointsBet;
            if (pointsLeft < currBetPoints) {
                await modalSubmitInteraction.reply({content: `Error: You do not have enough Cringe points (**${pointsLeft}** left).`, ephemeral: true});
                return;
            }
            
            await modalSubmitInteraction.deferReply();
            betYes ? bet.addYesBetter(user.id, currBetPoints) : bet.addNoBetter(user.id, currBetPoints);
            await interaction.editReply({embeds: [await bet.createBetEmbed(interaction.client.users)]});
            await modalSubmitInteraction.editReply(`${user} bet **${betYes ? 'YES' : 'NO'}** with **${currBetPoints.toLocaleString()}** Cringe points (**${(pointsBet + currBetPoints).toLocaleString()}** total, **${(pointsAvailable - pointsBet - currBetPoints).toLocaleString()}** left).`);
        }
        catch (err) {
            logError(err);
        }
    });
    buttonCollector.on('end', () => {
        if (!bet.isDeleted()) {
            if (bet.isValid()) {
                void endBet(interaction.user.id, interaction.client);
            }
            else {
                void deleteBet(interaction.user.id, interaction.client);
                void interaction.followUp(`Invalid bet ${betTitle} (not enough betters).`);
            }
        }
    });
}

const name = 'create';

const subcommandBuilder = new SlashCommandSubcommandBuilder ()
    .setName(name)
    .setDescription('Create a bet with cringe points.')
    .addStringOption((option) => option.setName('bet').setDescription('Enter a bet').setRequired(true))
    .addNumberOption((option) => option.setName('time').setDescription('Enter the time left in minutes to bet').setRequired(true).setMinValue(0.5));

export default { execute, name, subcommandBuilder };