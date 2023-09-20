import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { newPvEBattle } from '../../../autoBattler/autoBattlerManager';


async function execute(interaction: ChatInputCommandInteraction) {
    await newPvEBattle(interaction);
}

const name = 'pve';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Auto Battler');

export default { execute, name, subcommandBuilder };