import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, ModalActionRowComponentBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { nanoid } from 'nanoid';
import { convertDateToUnixTimestamp, timeInMS } from '../util';
import { createBet } from '../bets';

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
    const unixTimestamp = convertDateToUnixTimestamp(new Date(Date.now() + time * timeInMS.second));
    const bet = createBet(betTitle, userId, unixTimestamp);
    if (!bet) {
        void interaction.reply('You already have an active bet.');
        return;
    }

    const buttonsRow = new ActionRowBuilder<ButtonBuilder>();
    buttonsRow.addComponents(
        new ButtonBuilder()
            .setCustomId(ButtonId.BetYes)
            .setLabel('Bet Yes')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId(ButtonId.BetNo)
            .setLabel('Bet No')
            .setStyle(ButtonStyle.Danger),
    );
    void interaction.editReply({embeds: [bet.createBetEmbed()], components: [buttonsRow]});

    const buttonCollector = interaction.channel.createMessageComponentCollector({ componentType: ComponentType.Button, time: time * timeInMS.second });
    buttonCollector.on('collect', async buttonInteraction => {
        if (buttonInteraction.customId === ButtonId.BetYes && bet.isNoBetter(buttonInteraction.user.id) ||
            buttonInteraction.customId === ButtonId.BetNo && bet.isYesBetter(buttonInteraction.user.id)) {
            void buttonInteraction.reply({ephemeral: true, content: 'You cannot vote both Yes and No.'});
            return;
        }

        const betYes = buttonInteraction.customId === ButtonId.BetYes;
        const pointsInput = new TextInputBuilder()
            .setCustomId('points')
            .setLabel('Points')
            .setStyle(TextInputStyle.Short);
        const pointsActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(pointsInput);
        const modal = new ModalBuilder()
            .setCustomId(nanoid())
            .setTitle(`Vote ${betYes ? 'YES' : 'NO'}`)
            .setComponents(pointsActionRow);
        void buttonInteraction.showModal(modal);

        try {
            const modalSubmitInteraction = await buttonInteraction.awaitModalSubmit({ time: 5_000 });
            if (modalSubmitInteraction.customId !== modal.data.custom_id) return;
            const points = parseInt(modalSubmitInteraction.fields.getTextInputValue('points'));
            if (isNaN(points)) {
                void modalSubmitInteraction.reply(`${buttonInteraction.user} Invalid input. Enter a number.`);
                return;
            }
            betYes ? bet.addYesBetter(modalSubmitInteraction.user.id, points) : bet.addNoBetter(modalSubmitInteraction.user.id, points);
            await interaction.editReply({embeds: [bet.createBetEmbed()]});
            await modalSubmitInteraction.reply(`${buttonInteraction.user} bet **${betYes ? 'YES' : 'NO'}** with **${points}** Cringe points.`);
        }
        catch (err) {
            // console.log(err);
        }
    });
    buttonCollector.on('end', async () => {
        void interaction.editReply({components: []});
        void interaction.followUp({embeds: [await bet.createBettersEmbed(interaction.client.users)]});
    });
}

const name = 'create-bet';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Create a bet with cringe points.')
    .addStringOption((option) => option.setName('bet').setDescription('Enter a bet').setRequired(true))
    .addNumberOption((option) => option.setName('time').setDescription('Enter the time left in seconds to bet').setRequired(true));

export default { execute, name, commandBuilder };