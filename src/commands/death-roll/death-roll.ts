import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, ComponentType, SlashCommandBuilder, userMention } from 'discord.js';
import { DeathRoll } from './DeathRoll';
import { getUserCringePoints } from '../../sql/tables/cringe_points';

const houseMaxWager = 25_000;

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const reply = await interaction.fetchReply();
    const user = interaction.user;
    const opponent = interaction.options.getUser('user');
    const wager = interaction.options.getInteger('wager');
    const startingRoll = interaction.options.getInteger('roll') ?? 100;

    if (!opponent || !wager) {
        await interaction.editReply('Error creating bet (invalid opponent or wager).');
        return;
    }

    if (user.id === opponent.id) {
        await interaction.editReply('You cannot duel yourself.');
        return;
    }

    const userPoints = await getUserCringePoints(user.id) ?? 0;
    if (opponent.id === process.env.CLIENT_ID) {
        if (wager > houseMaxWager) {
            await interaction.editReply(`Bot max wager is ${houseMaxWager.toLocaleString()}`);
            return;
        }

        const deathRoll = new DeathRoll(user, opponent, wager, startingRoll, interaction.client, interaction.channelId);

        while (!deathRoll.isEnded()){
            await deathRoll.roll(deathRoll.turnUser.id);
        }
        await interaction.editReply({embeds: [deathRoll.createEmbed()], components: []});
    } else {

        const opponentPoints = await getUserCringePoints(opponent.id) ?? 0;
        if (userPoints < wager || opponentPoints < wager) {
            await interaction.editReply('You and/or your opponent do not have enough points.');
            return;
        }

        const deathRoll = new DeathRoll(user, opponent, wager, startingRoll, interaction.client, interaction.channelId);

        const buttonsRow = new ActionRowBuilder<ButtonBuilder>();
        buttonsRow.addComponents(
            new ButtonBuilder()
                .setCustomId('roll')
                .setLabel('Roll')
                .setStyle(ButtonStyle.Success)
        );
        await reply.channel.send(`${userMention(user.id)} challenged ${userMention(opponent.id)} to a death roll.`);
        await interaction.editReply({embeds: [deathRoll.createEmbed()], components: !deathRoll.isEnded() && !deathRoll.isExpired() ? [buttonsRow] : []});
        
        const rollButtonFilter = async (i: ButtonInteraction) => {
            if (user.id !== i.user.id && opponent.id !== i.user.id) {
                await i.reply({content: 'You are not in this death roll.', ephemeral: true});
                return false;
            }
            return true;
        };

        const buttonCollector = reply.createMessageComponentCollector({ componentType: ComponentType.Button, time: DeathRoll.idleTimeout, filter: rollButtonFilter });
        buttonCollector.on('collect', async buttonInteraction => {
            const {correctUser, ended} = await deathRoll.roll(buttonInteraction.user.id);
            if (ended) buttonCollector.stop();
            else {
                if (correctUser) {
                    buttonCollector.resetTimer();
                    await buttonInteraction.update({embeds: [deathRoll.createEmbed()]});
                }
                else {
                    await buttonInteraction.reply({content: 'It is not your turn.', ephemeral: true});
                }
            }
        });

        buttonCollector.on('end', async () => {
            if (!deathRoll.isEnded()) {
                deathRoll.expire();
            }
            await reply.edit({embeds: [deathRoll.createEmbed()], components: []});
        });
    }
}

const name = 'death-roll';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Challenge another user to a Death Roll.')
    .addUserOption(option => option
        .setName('user')
        .setDescription('Select a user to duel.')
        .setRequired(true)
    )
    .addIntegerOption(option => option
        .setName('wager')
        .setDescription('Enter the wager to duel with.')
        .setRequired(true)
        .setMinValue(1)
    )
    .addIntegerOption(option => option
        .setName('roll')
        .setDescription('Enter the starting roll.')
        .setMinValue(10)
    );

export default { execute, name, commandBuilder };