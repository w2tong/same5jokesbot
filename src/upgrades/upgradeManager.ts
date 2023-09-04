import { getAllUpgrades } from '../sql/tables/upgrades';
import upgrades from './upgrades';

type Upgrade = keyof typeof upgrades.dailyUpgrades | keyof typeof upgrades.stealUpgrades;

const userUpgrades: {[userId: string]: UserUpgrades} = {};
type UserUpgrades = {[upgrade in Upgrade]: number};

const upgradeIds: string[] = [];
let upgradeType: keyof typeof upgrades;
for (upgradeType in upgrades) {
    upgradeIds.push(...Object.keys(upgrades[upgradeType]));
}

const emptyUserUpgrades: UserUpgrades = {
    //daily
    reward: 0,

    // steal
    stealChance: 0,
    stolenGoodChanceReduction: 0,
    stealDefence: 0,
    paybackReduction: 0
};

function upgrade(userId: string, upgrade: Upgrade) {
    if (!userUpgrades[userId]) userUpgrades[userId] = JSON.parse(JSON.stringify(emptyUserUpgrades)) as UserUpgrades;
    userUpgrades[userId][upgrade]++;
    // updateUpgrade(userId, upgrade) db func
}

async function loadUpgrades() {
    const upgrades = await getAllUpgrades();

    for (const {USER_ID, UPGRADE_ID, UPGRADE_LEVEL} of upgrades) {
        if (!userUpgrades[USER_ID]) userUpgrades[USER_ID] = JSON.parse(JSON.stringify(emptyUserUpgrades)) as UserUpgrades;
        userUpgrades[USER_ID][UPGRADE_ID as Upgrade] = UPGRADE_LEVEL;
    }
}

export {Upgrade, userUpgrades, upgradeIds, upgrade, loadUpgrades};