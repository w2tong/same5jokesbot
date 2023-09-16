import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, ComponentType, SlashCommandSubcommandBuilder, userMention } from 'discord.js';
import Battle, { Side } from '../../../autoBattler/Battle';
import { ClassStats } from '../../../autoBattler/templates';
import { nanoid } from 'nanoid';
import { DeathRoll } from '../../death-roll/DeathRoll';
import Fighter from '../../../autoBattler/Classes/Fighter';


async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const user = interaction.user;
    const opponent = interaction.options.getUser('user');
    if (!opponent || !interaction.channel) {
        await interaction.editReply('There was an error creating the auto battle.');
        return;
    }

    const battle = new Battle();
    const userChar = new Fighter(ClassStats.Fighter, user.username, 0, Side.Left, battle, user.id);
    const opponentChar = new Fighter(ClassStats.Fighter, opponent.username, 0, Side.Right, battle, opponent.id);
    battle.addChars([userChar], [opponentChar]);

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
            let combatEnd = false;
            // let winner;
            while(!combatEnd) {
                const res = battle.nextTurn();
                await buttonInteraction.editReply({embeds: [battle.generateEmbed()]});
                combatEnd = res.combatEnded;
                // winner = res.winner;
            }
            await buttonInteraction.editReply({embeds: [battle.generateEmbed()]});
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