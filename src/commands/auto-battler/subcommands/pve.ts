import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { newPvEBattle } from '../../../autoBattler/autoBattlerManager';


async function execute(interaction: ChatInputCommandInteraction) {
    await newPvEBattle(interaction);
}

const name = 'pve';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Auto Battler')
    .addIntegerOption(option => option
        .setName('level')
        .setDescription('Enter the level of the encounter to fight.')
        .setMinValue(1)
        .setMaxValue(20)
    )
    .addBooleanOption(option => option
        .setName('full-log')
        .setDescription('Display the full combat log.')
    );

export default { execute, name, subcommandBuilder };