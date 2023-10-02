import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { upgrade } from '../../../upgrades/upgradeManager';
import { AutoBattlerId, autoBattlerUpgradeIds, upgrades } from '../../../upgrades/upgrades';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const upgradeId = interaction.options.getString('upgrade') as AutoBattlerId;
    const res = await upgrade(interaction.user, upgradeId);
    await interaction.editReply(res);
}

const name = 'auto-battler';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Auto Battler upgrades.')
    .addStringOption(option => option
        .setName('upgrade')
        .setDescription('Select an upgrade.')
        .setRequired(true)
        .addChoices(...autoBattlerUpgradeIds.map(id=> {return {name: upgrades[id].name, value: id};}))
    );

export default { execute, name, subcommandBuilder };