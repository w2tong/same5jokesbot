import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, ComponentType, SlashCommandSubcommandBuilder, userMention } from 'discord.js';
import Battle, { Side } from '../../../autoBattler/Battle';
import { ClassStats } from '../../../autoBattler/templates';
import { nanoid } from 'nanoid';
import { DeathRoll } from '../../death-roll/DeathRoll';
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
        [new Classes[userChar.CLASS_NAME](ClassStats[userChar.CLASS_NAME], userChar.CHAR_NAME, 0, Side.Left, battle, interaction.user.id)],
        [new Classes[opponentChar.CLASS_NAME](ClassStats[opponentChar.CLASS_NAME], opponentChar.CHAR_NAME, 0, Side.Right, battle, interaction.user.id)],
    );

    const acceptButtonId = `ab-accept-${nanoid()}`;
    const decliceButtonId = `ab-decline-${nanoid()}`;
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
    await interaction.editReply({embeds: [battle.generateEmbed()], components: [buttonsRow]});
    await interaction.channel.send(`${userMention(user.id)} challenged ${userMention(opponent.id)} to an auto battle.`);

    const buttonFilter = async (i: ButtonInteraction) => {
        if (i.customId !== acceptButtonId && i.customId !== decliceButtonId) {
            return false;
        }
        if (i.user.id !== opponent.id) {
            await i.reply({content: 'You are not in this auto battle.', ephemeral: true});
            return false;
        }
        return true;
    };

    const buttonCollector = interaction.channel.createMessageComponentCollector({ componentType: ComponentType.Button, time: DeathRoll.idleTimeout, filter: buttonFilter });
    buttonCollector.on('collect', async buttonInteraction => {
        await buttonInteraction.update({components: []});
        buttonCollector.stop();
        if (buttonInteraction.customId === acceptButtonId) {
            battle.startCombat();
            const interval = setInterval(() => {
                void (async () => {
                    const res = battle.nextTurn();
                    if (res.combatEnded) {
                        clearInterval(interval);
                        // const balanceEmbed = new EmbedBuilder().addFields;
                        await interaction.editReply({embeds: [battle.generateEmbed()]});
                    }
                    else {
                        await interaction.editReply({embeds: [battle.generateEmbed()]});
                    }
                })();
            }, 1 * timeInMS.second);
        }
        else {
            await buttonInteraction.editReply({content: `${userMention(opponent.id)} declined the auto battle.`, embeds: []});
        }
    });
}

const name = 'pvp';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Auto Battler')
    .addUserOption(option => option
        .setName('user')
        .setDescription('Select a user')
    )
    .addIntegerOption(option => option
        .setName('wager')
        .setDescription('Enter a wager.')
        .setMinValue(1)
        .setRequired(false)
    );

export default { execute, name, subcommandBuilder };