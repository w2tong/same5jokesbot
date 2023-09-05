type Upgrade = {
    name: string;
    description: string;
    readonly levels: number[];
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
        levels: [0,5,10,15,20,25]
    },

    // Steal
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

export {
    // Daily
    dailyUpgradeIds, DailyUpgradeId,
    // Steal
    stealUpgradeIds, StealUpgradeId,
    // Union
    UpgradeId, upgradeIds, upgrades
};