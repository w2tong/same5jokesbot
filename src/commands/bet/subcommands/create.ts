import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, ModalActionRowComponentBuilder, ModalBuilder, SlashCommandSubcommandBuilder, TextInputBuilder, TextInputStyle, bold, userMention } from 'discord.js';
import { nanoid } from 'nanoid';
import { timeInMS } from '../../../util/util';
import { createBet, deleteBet, endBet } from '../betManager';
import { getUserCringePoints } from '../../../sql/tables/cringe_points';
import { logError } from '../../../logger';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const user = interaction.user;
    
    const betTitle = interaction.options.getString('bet');
    const time = interaction.options.getNumber('time');
    if (!betTitle || !time || !interaction.channel) {
        void interaction.editReply('Error creating bet (invalid bet or time)');
        return;
    }
    
    const endTime = new Date(Date.now() + time * timeInMS.minute).getTime();
    const bet = createBet(betTitle, user.id, endTime, interaction.channelId, (await interaction.fetchReply()).id);
    if (!bet) {
        void interaction.editReply('You already have an active bet.');
        return;
    }

    const yesButtonCustomId = 'yes';
    const noButtonCustomId = 'no';
    const buttonsRow = new ActionRowBuilder<ButtonBuilder>();
    buttonsRow.addComponents(
        new ButtonBuilder()
            .setCustomId(yesButtonCustomId)
            .setLabel('Yes')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId(noButtonCustomId)
            .setLabel('No')
            .setStyle(ButtonStyle.Danger),
    );
    const res = await interaction.editReply({embeds: [bet.createBetEmbed()], components: [buttonsRow]});

    const buttonCollector = res.createMessageComponentCollector({ componentType: ComponentType.Button, time: time * timeInMS.minute});
    buttonCollector.on('collect', async buttonInteraction => {
        if (buttonInteraction.customId === yesButtonCustomId && bet.isNoBetter(buttonInteraction.user.id) ||
            buttonInteraction.customId === noButtonCustomId && bet.isYesBetter(buttonInteraction.user.id)) {
            await buttonInteraction.reply({content: 'You cannot vote both Yes and No.', ephemeral: true});
            return;
        }

        const betYes = buttonInteraction.customId === yesButtonCustomId;
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
        await buttonInteraction.showModal(modal);

        try {
            const modalSubmitInteraction = await buttonInteraction.awaitModalSubmit({ time: 60_000 });
            const user = modalSubmitInteraction.user;
            if (modalSubmitInteraction.customId !== modal.data.custom_id) return;
            if (bet.isEnded()) {
                await modalSubmitInteraction.reply({content: 'Error: The bet has ended.', ephemeral: true});
                return;
            }
            const currBetPoints = parseInt(modalSubmitInteraction.fields.getTextInputValue('points'));
            if (isNaN(currBetPoints)) {
                await modalSubmitInteraction.reply({content: 'Error: Invalid input. Enter a number.', ephemeral: true});
                return;
            }
            if (currBetPoints <= 0) {
                await modalSubmitInteraction.reply({content: 'Error: Invalid input. Enter a number greater than 0.', ephemeral: true});
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
                await modalSubmitInteraction.reply({content: `Error: You do not have enough Cringe points (${bold(pointsLeft.toLocaleString())} left).`, ephemeral: true});
                return;
            }
            
            await modalSubmitInteraction.deferReply();
            betYes ? bet.addYesBetter(user.id, currBetPoints) : bet.addNoBetter(user.id, currBetPoints);
            await buttonInteraction.editReply({embeds: [bet.createBetEmbed()]});
            await modalSubmitInteraction.editReply(`${userMention(user.id)} bet ${bold(betYes ? 'YES' : 'NO')} with ${bold(currBetPoints.toLocaleString())} Cringe points (${bold((pointsBet + currBetPoints).toLocaleString())} total, ${bold((pointsAvailable - pointsBet - currBetPoints).toLocaleString())} left).`);
        }
        catch (err) {
            logError(err);
        }
    });
    buttonCollector.on('end', () => {
        if (!bet.isDeleted()) {
            if (bet.isValid()) {
                void endBet(user.id, res.client);
            }
            else {
                void deleteBet(user.id, res.client);
                void res.reply(`Invalid bet ${betTitle} (not enough betters).`);
            }
        }
    });
}

const name = 'create';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Create a bet with Cringe points.')
    .addStringOption((option) => option.setName('bet').setDescription('Enter a bet.').setRequired(true))
    .addNumberOption((option) => option.setName('time').setDescription('Enter amount of time users have to bet.').setRequired(true).setMinValue(0.5));

export default { execute, name, subcommandBuilder };