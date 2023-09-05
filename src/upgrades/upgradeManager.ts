import { EmbedBuilder, InteractionEditReplyOptions, User } from 'discord.js';
import { getAllUpgrades, updateUpgrades } from '../sql/tables/upgrades';
import { UpgradeId, upgrades } from './upgrades';
import { emptyEmbedFieldInline } from '../util/discordUtil';
import { getDailyCoins, updateDailyCoins } from '../sql/tables/daily-coins';

const upgradePrice = 10;
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
    const coins = await getDailyCoins(user.id) ?? 0;
    if (coins < upgradePrice) return {content: `You do not have enough coins (price: ${upgradePrice}, balance: ${coins}).`};

    if (!userUpgrades[user.id]) userUpgrades[user.id] = JSON.parse(JSON.stringify(emptyUserUpgrades)) as UserUpgrades;
    
    const userUpgradeLevel = userUpgrades[user.id][upgradeId];
    const upgrade = upgrades[upgradeId];
    if (userUpgradeLevel+1 >= upgrade.levels.length) return {content: `You are at the max level for ${upgrade.name}.`};
    
    const embed = new EmbedBuilder()
        .setAuthor({name: `${user.username} upgraded ${upgrade.name} from level ${userUpgradeLevel} to level ${userUpgradeLevel+1}.`, iconURL: user.displayAvatarURL()})
        .setDescription(upgrade.description)
        .addFields(
            {name: 'Old Value', value: `${upgrade.levels[userUpgradeLevel]}${upgrade.suffix ?? ''}`, inline: true},
            emptyEmbedFieldInline,
            {name: 'New Value', value: `${upgrade.levels[userUpgradeLevel+1]}${upgrade.suffix ?? ''}`, inline: true},

            {name: 'Balance', value: `${coins.toLocaleString()} (-${upgradePrice.toLocaleString()})`, inline: true},
            emptyEmbedFieldInline,
            {name: 'New Balance', value: `${(coins - upgradePrice).toLocaleString()}`, inline: true}
        )
    ;

    userUpgrades[user.id][upgradeId]++;
    await updateUpgrades(user.id, upgradeId);
    await updateDailyCoins(user.id, -upgradePrice);

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