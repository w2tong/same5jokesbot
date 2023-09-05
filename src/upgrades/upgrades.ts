import { bold } from 'discord.js';

type Upgrade = {
    name: string;
    description: string;
    readonly levels: number[];
    suffix?: string;
}

const dailyUpgradeIds = ['rewardIncrease'] as const;
type DailyUpgradeId = typeof dailyUpgradeIds[number]
const stealUpgradeIds = ['stealChance', 'stolenGoodChanceReduction', 'stealDefence', 'paybackReduction'] as const;
type StealUpgradeId = typeof stealUpgradeIds[number]

type UpgradeId = DailyUpgradeId | StealUpgradeId
const upgradeIds = [...dailyUpgradeIds, ...stealUpgradeIds];

const upgrades: {[key in UpgradeId]: Upgrade} = {
    // Daily
    rewardIncrease: {
        name: 'Reward Increase',
        description: 'Increase the amount of points you are rewarded when completing a Daily Quest.',
        levels: [0,10,20,30,40,50],
        suffix: '%',
    },

    // Steal
    stealChance: {
        name: 'Steal Chance',
        description: 'Increase your chance to steal.',
        levels: [0,2,4,6,8,10],
        suffix: '%'
    },
    stolenGoodChanceReduction: {
        name: 'Stolen Good Chance Reduction',
        description: 'Each stolen good reduces your chance of success.',
        levels: [0,0.5,1,1.5,2,2.5],
        suffix: '%'
    },
    stealDefence: {
        name: 'Steal Defence',
        description: 'Reduce the chances of users stealing from you.',
        levels: [0,1,2,3,4,5],
        suffix: '%'
    },
    paybackReduction: {
        name: 'Payback Reduction',
        description: 'Reduce the amount of extra points you return when you are caught.',
        levels: [0,2,4,6,8,10],
        suffix: '%'
    }
};

function upgradeLevelsToString(upgrade: Upgrade, currLvl?: number) {
    const levels = upgrade.levels.map(lvl => `${lvl}${upgrade.suffix ?? ''}`);
    if (currLvl) levels[currLvl] = bold(levels[currLvl]);
    return levels.slice(1).join(', ');
}

export {
    // Daily
    dailyUpgradeIds, DailyUpgradeId,
    // Steal
    stealUpgradeIds, StealUpgradeId,
    // Union
    UpgradeId, upgradeIds, upgrades, upgradeLevelsToString
};