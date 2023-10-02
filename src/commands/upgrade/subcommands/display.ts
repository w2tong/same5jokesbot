import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { autoBattlerUpgradeIds, stealUpgradeIds, upgradeLevelsToString, upgrades } from '../../../upgrades/upgrades';
import { emptyUserUpgrades, userUpgrades } from '../../../upgrades/upgradeManager';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const user = interaction.user;

    const embed = new EmbedBuilder()
        .setAuthor({name: `${user.username}'s Upgrades`, iconURL: user.displayAvatarURL()});

    for (const id of autoBattlerUpgradeIds) {
        const upgrade = upgrades[id];
        const currLvl = (userUpgrades[user.id] ?? emptyUserUpgrades)[id];
        embed.addFields({name: upgrade.name, value: `Level: ${currLvl}/${upgrade.levels.length-1}\n[${upgradeLevelsToString(upgrade, currLvl)}]`});
    }

    for (const id of stealUpgradeIds) {
        const upgrade = upgrades[id];
        const currLvl = (userUpgrades[user.id] ?? emptyUserUpgrades)[id];
        embed.addFields({name: upgrade.name, value: `Level: ${currLvl}/${upgrade.levels.length-1}\n[${upgradeLevelsToString(upgrade, currLvl)}]`});
    }

    await interaction.editReply({embeds: [embed]});
}

const name = 'display';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Display your upgrades.');

export default { execute, name, subcommandBuilder };