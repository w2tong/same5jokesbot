import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { upgrade } from '../../../upgrades/upgradeManager';
import { StealUpgradeId, stealUpgradeIds, upgrades } from '../../../upgrades/upgrades';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const upgradeId = interaction.options.getString('upgrade') as StealUpgradeId;
    const res = await upgrade(interaction.user, upgradeId);
    await interaction.editReply(res);
}

const name = 'steal';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Steal upgrades.')
    .addStringOption(option => option
        .setName('upgrade')
        .setDescription('Select an upgrade.')
        .setRequired(true)
        .addChoices(...stealUpgradeIds.map(id=> {return {name: upgrades[id].name, value: id};}))
    );

export default { execute, name, subcommandBuilder };