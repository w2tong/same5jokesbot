import { getAllUpgrades, updateUpgrades } from '../sql/tables/upgrades';
import { UpgradeId } from './upgrades';

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

async function upgrade(userId: string, upgrade: UpgradeId) {
    if (!userUpgrades[userId]) userUpgrades[userId] = JSON.parse(JSON.stringify(emptyUserUpgrades)) as UserUpgrades;
    userUpgrades[userId][upgrade]++;
    await updateUpgrades(userId, upgrade);
    return {old: userUpgrades[userId][upgrade]-1, new: userUpgrades[userId][upgrade]};
}

async function loadUpgrades() {
    const upgrades = await getAllUpgrades();

    for (const {USER_ID, UPGRADE_ID, UPGRADE_LEVEL} of upgrades) {
        if (!userUpgrades[USER_ID]) userUpgrades[USER_ID] = JSON.parse(JSON.stringify(emptyUserUpgrades)) as UserUpgrades;
        userUpgrades[USER_ID][UPGRADE_ID as UpgradeId] = UPGRADE_LEVEL;
    }
}

export {UpgradeId, userUpgrades, upgrade, loadUpgrades};