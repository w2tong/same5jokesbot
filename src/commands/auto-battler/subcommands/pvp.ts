import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { newPvPBattle } from '../../../autoBattler/autoBattlerManager';

async function execute(interaction: ChatInputCommandInteraction) {
    await newPvPBattle(interaction);
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
    )
    .addBooleanOption(option => option
        .setName('full-log')
        .setDescription('Display the full combat log.')
    );

export default { execute, name, subcommandBuilder };