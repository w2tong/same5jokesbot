type Upgrade = {
    name: string;
    description: string;
    readonly levels: number[];
}

const dailyUpgradeIds = ['rewardIncrease'] as const;
type DailyUpgradeId = typeof dailyUpgradeIds[number]
const dailyUpgrades: {[key in DailyUpgradeId]: Upgrade} = {
    rewardIncrease: {
        name: 'Reward Increase',
        description: 'Increase the amount of points you are rewarded when completing a Daily Quest.',
        levels: [0,5,10,15,20,25]
    }
};

const stealUpgradeIds = ['stealChance', 'stolenGoodChanceReduction', 'stealDefence', 'paybackReduction'] as const;
type StealUpgradeId = typeof stealUpgradeIds[number]
const stealUpgrades: {[key in StealUpgradeId]: Upgrade} = {
    stealChance: {
        name: 'Steal Chance',
        description: 'Increase your chance to steal.',
        levels: [0,2,4,6,8,10]
    },
    stolenGoodChanceReduction: {
        name: 'Stolen Good Chance Reduction',
        description: 'Each stolen good reduces your chance of success.',
        levels: [0,0.5,1,1.5,2,2.5]
    },
    stealDefence: {
        name: 'Steal Defence',
        description: 'Reduce the chances of users stealing from you.',
        levels: [0,1,2,3,4,5],
    },
    paybackReduction: {
        name: 'Payback Reduction',
        description: 'Reduce the amount of extra points you return when you are caught.',
        levels: [0,2,4,6,8,10]
    }
    
};

type UpgradeId = DailyUpgradeId | StealUpgradeId
const upgradeIds = [...dailyUpgradeIds, ...stealUpgradeIds];

export {
    // Daily
    dailyUpgradeIds, DailyUpgradeId, dailyUpgrades,
    // Steal
    stealUpgradeIds, StealUpgradeId, stealUpgrades,
    // Union
    UpgradeId, upgradeIds, 
};