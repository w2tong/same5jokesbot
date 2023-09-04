const dailyUpgrades = {
    reward: [0,5,10,15,20,25]
} as const;

const stealUpgrades = {
    stealChance: [0,2,4,6,8,10],
    stolenGoodChanceReduction: [0,0.5,1,1.5,2,2.5],
    stealDefence: [0,1,2,3,4,5],
    paybackReduction: [0,2,4,6,8,10]
} as const;

export default { dailyUpgrades, stealUpgrades };