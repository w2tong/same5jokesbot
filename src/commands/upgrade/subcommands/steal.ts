import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { upgrade } from '../../../upgrades/upgradeManager';
import { StealUpgradeId, stealUpgrades } from '../../../upgrades/upgrades';
import { emptyEmbedFieldInline } from '../../../util/discordUtil';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const upgradeId = interaction.options.getString('upgrade') as StealUpgradeId;
    await upgrade(interaction.user.id, upgradeId);

    const embed = new EmbedBuilder()
        .setAuthor({name: `${stealUpgrades[upgradeId].name} Upgrade bought.`, iconURL: interaction.user.displayAvatarURL()})
        .addFields(
            {name: 'Old Value', value: `${'PH'}`, inline: true},
            emptyEmbedFieldInline,
            {name: 'New Value', value: `${'PH'}`, inline: true},

            {name: 'Balance', value: `${'PH'}`, inline: true},
            emptyEmbedFieldInline,
            {name: 'New Balance', value: `${'PH'}`, inline: true}
        )
    ;
    await interaction.editReply({embeds: [embed]});
}

const name = 'steal';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Upgrade steal')
    .addStringOption(option => option
        .setName('upgrade')
        .setDescription('Select an upgrade.')
        .addChoices(...Object.entries(stealUpgrades).map(([id, upgrade])=> {return {name: upgrade.name, value: id};}))
    );

export default { execute, name, subcommandBuilder };