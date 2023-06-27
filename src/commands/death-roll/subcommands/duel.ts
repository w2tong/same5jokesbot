import { ButtonInteraction, ChatInputCommandInteraction, ComponentType, SlashCommandSubcommandBuilder } from 'discord.js';
import { timeInMS } from '../../../util/util';
import { DeathRoll } from '../../../deathRoll';
import { getUserCringePoints, updateCringePoints } from '../../../sql/tables/cringe-points';
import { updateDeathRollProfits } from '../../../sql/tables/death-roll-profits';

const time = 300;

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const user = interaction.user;
    const opponent = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    const startingRoll = interaction.options.getInteger('roll') ?? 100;

    if (!opponent || !amount || !interaction.channel) {
        void interaction.editReply('Error creating bet (invalid opponent or amount)');
        return;
    }

    if (user.id === opponent.id) {
        await interaction.editReply('You cannot duel yourself.');
        return;
    }

    if (opponent.bot) {
        await interaction.editReply('You cannot duel a bot.');
        return;
    }

    const userPoints = await getUserCringePoints(user.id) ?? 0;
    const opponentPoints = await getUserCringePoints(opponent.id) ?? 0;
    if (userPoints < amount || opponentPoints < amount) {
        await interaction.editReply('You and/or your opponent do not have enough points.');
        return;
    }

    const deathRoll = new DeathRoll(user, opponent, amount, startingRoll);
    await interaction.editReply(deathRoll.createReply());
    
    const userFilter = async (i: ButtonInteraction) => {
        if (user.id === i.user.id || opponent.id === i.user.id) {
            return true;
        }
        await i.reply({content: 'You are not in this death roll.', ephemeral: true});
        return false;
    };

    const buttonCollector = interaction.channel.createMessageComponentCollector({ componentType: ComponentType.Button, time: time * timeInMS.second, filter: userFilter });
    buttonCollector.on('collect', async buttonInteraction => {
        const {correctUser, ended} = deathRoll.roll(buttonInteraction.user.id);
        if (ended) buttonCollector.stop();
        if (correctUser) {
            buttonCollector.resetTimer();
            await buttonInteraction.update(deathRoll.createReply());
        }
        else {
            await buttonInteraction.reply({content: 'It is not your turn.', ephemeral: true});
        }
    });

    buttonCollector.on('end', async () => {
        if (deathRoll.isEnded()) {
            const {winnerId, loserId} = deathRoll.getResults();
            void updateCringePoints([
                {userId: winnerId, points: amount},
                {userId: loserId, points: -amount}
            ]);
            void updateDeathRollProfits(winnerId, amount, 0);
            void updateDeathRollProfits(loserId, 0, amount);
        }
        else {
            deathRoll.expire();
            await interaction.editReply(deathRoll.createReply());
        }
    });
}

const name = 'duel';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Gets cringe point top slots profits.')
    .addUserOption(option => option
        .setName('user')
        .setDescription('Select a user to duel.')
        .setRequired(true)
    )
    .addIntegerOption(option => option
        .setName('amount')
        .setDescription('Enter the amount of Cringe points to duel with.')
        .setRequired(true)
        .setMinValue(1)
    )
    .addIntegerOption(option => option
        .setName('roll')
        .setDescription('Enter the starting roll.')
        .setMinValue(10)
    );

export default { execute, name, subcommandBuilder };