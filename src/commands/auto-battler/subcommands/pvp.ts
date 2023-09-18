import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, ComponentType, SlashCommandSubcommandBuilder, userMention } from 'discord.js';
import Battle, { Side } from '../../../autoBattler/Battle';
import { ClassStats } from '../../../autoBattler/statTemplates';
import { getABPSelectedCharacter } from '../../../sql/tables/ab_characters';
import { Classes } from '../../../autoBattler/Classes/classes';
import { timeInMS } from '../../../util/util';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const user = interaction.user;
    const opponent = interaction.options.getUser('user');
    if (!opponent || !interaction.channel) {
        await interaction.editReply('There was an error creating the auto battle.');
        return;
    }

    const battle = new Battle();

    const userChar = await getABPSelectedCharacter(user.id);
    const opponentChar = await getABPSelectedCharacter(opponent.id);

    if (!userChar) {
        await interaction.editReply('You do not have a selected character.');
        return;
    }
    if (!opponentChar) {
        await interaction.editReply(`${opponent} does not have a selected character.`);
        return;
    }

    battle.addChars(
        [new Classes[userChar.CLASS_NAME](userChar.CHAR_LEVEL, ClassStats[userChar.CLASS_NAME], userChar.CHAR_NAME, {ref: battle, side: Side.Left, index: 0}, {userId: user.id})],
        [new Classes[opponentChar.CLASS_NAME](opponentChar.CHAR_LEVEL, ClassStats[opponentChar.CLASS_NAME], opponentChar.CHAR_NAME, {ref: battle, side: Side.Right, index: 0}, {userId: opponent.id})],
    );

    const acceptButtonId = 'accept';
    const decliceButtonId = 'decline';
    const buttonsRow = new ActionRowBuilder<ButtonBuilder>();
    buttonsRow.addComponents(
        new ButtonBuilder()
            .setCustomId(acceptButtonId)
            .setLabel('Accept')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId(decliceButtonId)
            .setLabel('Decline')
            .setStyle(ButtonStyle.Danger)
    );
    const reply = await interaction.editReply({embeds: [battle.generateEmbed()], components: [buttonsRow]});
    await interaction.channel.send(`${userMention(user.id)} challenged ${userMention(opponent.id)} to an auto battle.`);

    const buttonFilter = async (i: ButtonInteraction) => {
        if (i.user.id !== opponent.id) {
            await i.reply({content: 'You are not in this auto battle.', ephemeral: true});
            return false;
        }
        return true;
    };

    const buttonCollector = reply.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15*timeInMS.minute, filter: buttonFilter });
    buttonCollector.on('collect', async buttonInteraction => {
        await buttonInteraction.update({});
        buttonCollector.stop();
        if (buttonInteraction.customId === acceptButtonId) {
            battle.startCombat();
            const interval = setInterval(() => {
                void (async () => {
                    const res = battle.nextTurn();
                    if (res.combatEnded) {
                        clearInterval(interval);
                        // const balanceEmbed = new EmbedBuilder().addFields;
                        await buttonInteraction.editReply({embeds: [battle.generateEmbed()]});
                    }
                    else {
                        await buttonInteraction.editReply({embeds: [battle.generateEmbed()]});
                    }
                })();
            }, 1 * timeInMS.second);
        }
        else {
            await buttonInteraction.editReply({content: `${userMention(opponent.id)} declined the auto battle.`, embeds: [], components: []});
        }
    });

    buttonCollector.on('end', async () => {
        await reply.edit({components: []});
    });
}

const name = 'pvp';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Auto Battler')
    .addUserOption(option => option
        .setName('user')
        .setDescription('Select a user')
        .setRequired(true)
    )
    .addIntegerOption(option => option
        .setName('wager')
        .setDescription('Enter a wager.')
        .setMinValue(1)
    );

export default { execute, name, subcommandBuilder };