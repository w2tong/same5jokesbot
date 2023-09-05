import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { stealUpgradeIds, upgradeLevelsToString, upgrades } from '../../../upgrades/upgrades';
import { userUpgrades } from '../../../upgrades/upgradeManager';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const user = interaction.user;

    const names: string[] = [];
    const currentLevels: string[] = [];
    const levels: string[] = [];
    for (const id of stealUpgradeIds) {
        const upgrade = upgrades[id];
        const currLvl = userUpgrades[user.id][id];
        names.push(upgrade.name);
        currentLevels.push(`${currLvl}/${upgrade.levels.length-1}`);
        levels.push(`[${upgradeLevelsToString(upgrade, currLvl)}]`);
    }

    const embed = new EmbedBuilder()
        .setAuthor({name: `${user.username}'s Upgrades`, iconURL: user.displayAvatarURL()})
        .addFields(
            {name: 'Upgrade', value: names.join('\n'), inline: true},
            {name: 'Current Level', value: currentLevels.join('\n'), inline: true},
            {name: 'Levels', value: levels.join('\n'), inline: true}
        );
    await interaction.editReply({embeds: [embed]});
}

const name = 'display';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Display your upgrades.');

export default { execute, name, subcommandBuilder };