import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { stealUpgradeIds, upgradeLevelsToString, upgrades } from '../../../upgrades/upgrades';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const embed = new EmbedBuilder()
        .setTitle('Upgrade Info');

    for (const id of stealUpgradeIds) {
        const upgrade = upgrades[id];
        embed.addFields({name: upgrade.name, value: `${upgrade.description}\nLevels: [${upgradeLevelsToString(upgrade)}]`});
    }

    await interaction.editReply({embeds: [embed]});
}

const name = 'info';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Get info about upgrades');

export default { execute, name, subcommandBuilder };