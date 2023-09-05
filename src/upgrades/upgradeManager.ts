import { EmbedBuilder, InteractionEditReplyOptions, User } from 'discord.js';
import { getAllUpgrades, updateUpgrades } from '../sql/tables/upgrades';
import { UpgradeId, upgrades } from './upgrades';
import { emptyEmbedFieldInline } from '../util/discordUtil';

const userUpgrades: {[userId: string]: UserUpgrades} = {};
type UserUpgrades = {[upgrade in UpgradeId]: number};

const emptyUserUpgrades: UserUpgrades = {
    //daily
    rewardIncrease: 0,

    // steal
    stealChance: 0,
    stolenGoodChanceReduction: 0,
    stealDefence: 0,
    paybackReduction: 0
};

async function upgrade(user: User, upgradeId: UpgradeId): Promise<InteractionEditReplyOptions> {
    if (!userUpgrades[user.id]) userUpgrades[user.id] = JSON.parse(JSON.stringify(emptyUserUpgrades)) as UserUpgrades;
    
    const userUpgradeLevel = userUpgrades[user.id][upgradeId];
    const upgrade = upgrades[upgradeId];
    const embed = new EmbedBuilder()
        .setAuthor({name: `${user.username} upgraded ${upgrade.name} from level ${userUpgradeLevel} to level ${userUpgradeLevel+1}.`, iconURL: user.displayAvatarURL()})
        .setDescription(upgrade.description)
        .addFields(
            {name: 'Old Value', value: `${upgrade.levels[userUpgradeLevel]}`, inline: true},
            emptyEmbedFieldInline,
            {name: 'New Value', value: `${upgrade.levels[userUpgradeLevel+1]}`, inline: true},

            {name: 'Balance', value: `${'PH'}`, inline: true},
            emptyEmbedFieldInline,
            {name: 'New Balance', value: `${'PH'}`, inline: true}
        )
    ;

    userUpgrades[user.id][upgradeId]++;
    await updateUpgrades(user.id, upgradeId);

    return {embeds: [embed]};
}

async function loadUpgrades() {
    const upgrades = await getAllUpgrades();

    for (const {USER_ID, UPGRADE_ID, UPGRADE_LEVEL} of upgrades) {
        if (!userUpgrades[USER_ID]) userUpgrades[USER_ID] = JSON.parse(JSON.stringify(emptyUserUpgrades)) as UserUpgrades;
        userUpgrades[USER_ID][UPGRADE_ID as UpgradeId] = UPGRADE_LEVEL;
    }
}

export {UpgradeId, userUpgrades, upgrade, loadUpgrades};