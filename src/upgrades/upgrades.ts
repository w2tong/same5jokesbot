import { bold } from 'discord.js';
import { roundToDecimalPlaces } from '../util/util';

type Upgrade = {
    name: string;
    description: string;
    readonly levels: number[];
    percentage: boolean;
}

const autoBattlerUpgradeIds = ['attackBonus', 'armourClass', 'health'] as const;
type AutoBattlerId = typeof autoBattlerUpgradeIds[number]
const dailyUpgradeIds = ['rewardIncrease'] as const;
type DailyUpgradeId = typeof dailyUpgradeIds[number]
const stealUpgradeIds = ['stealChance', 'stolenGoodChanceReduction', 'stealDefence', 'paybackReduction'] as const;
type StealUpgradeId = typeof stealUpgradeIds[number]

type UpgradeId = AutoBattlerId | DailyUpgradeId | StealUpgradeId
const upgradeIds = [...autoBattlerUpgradeIds, ...dailyUpgradeIds, ...stealUpgradeIds];

const upgrades: {[key in UpgradeId]: Upgrade} = {
    // Auto Battler
    attackBonus: {
        name: 'Auto Battler - Attack Bonus',
        description: 'Increase the Attack Bonus of all your Auto Battler characters.',
        levels: [0, 1, 2, 3],
        percentage: false
    },
    armourClass: {
        name: 'Auto Battler - Armour Class',
        description: 'Increase the Armour Class of all your Auto Battler characters.',
        levels: [0, 1, 2, 3],
        percentage: false
    },
    health: {
        name: 'Auto Battler - Health',
        description: 'Increase the Health of all your Auto Battler characters.',
        levels: [0, 2, 4, 6, 8, 10],
        percentage: false
    },

    // Daily
    rewardIncrease: {
        name: 'Reward Increase',
        description: 'Increase the amount of points you are rewarded when completing a Daily Quest.',
        levels: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
        percentage: true
    },

    // Steal
    stealChance: {
        name: 'Steal Chance',
        description: 'Increase your chance to steal.',
        levels: [0, 0.02, 0.04, 0.06, 0.08, 0.10],
        percentage: true
    },
    stolenGoodChanceReduction: {
        name: 'Stolen Good Chance Reduction',
        description: 'Each stolen good reduces your chance of success.',
        levels: [0, 0.005,0.01, 0.015, 0.02, 0.025],
        percentage: true
    },
    stealDefence: {
        name: 'Steal Defence',
        description: 'Reduce the chances of users stealing from you.',
        levels: [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.10],
        percentage: true
    },
    paybackReduction: {
        name: 'Payback Reduction',
        description: 'Reduce the amount of extra points you return when you are caught.',
        levels: [0, 0.02, 0.04, 0.06, 0.08, 0.1],
        percentage: true
    }
};

function upgradeLevelsToString(upgrade: Upgrade, currLvl?: number) {
    const levels = upgrade.levels.map(lvl => 
        upgrade.percentage ? `${roundToDecimalPlaces(lvl*100, 1)}%` : `${lvl}`
    );
    if (currLvl) levels[currLvl] = `[${bold(levels[currLvl])}]`;
    return levels.slice(1).join(', ');
}

export {
    // Auto Battler

    // Daily
    dailyUpgradeIds, DailyUpgradeId,
    // Steal
    stealUpgradeIds, StealUpgradeId,
    // Union
    UpgradeId, upgradeIds, upgrades, upgradeLevelsToString
};