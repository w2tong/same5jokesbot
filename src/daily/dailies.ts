type DailyId =  'bjGame' | 'bjWager' | 'bjWin' | 'bjProfit' |
                'deathRollGame' | 'deathRollWager' | 'deathRollWin' | 'deathRollProfit' |
                'gGame' | 'gWager' | 'gWin' | 'gProfit' |
                'lotteryBuy' |
                'slotsGame' | 'slotsWager' | 'slotsWin' | 'slotsProfit' |
                'stealAttempt'
                ;

type Daily = {
    description: string;
    maxProgress: number;
    reward: number;
}

const dailies: {[key in DailyId]: Daily} = {
    // Blackjack Dailies
    bjGame: {
        description: `Play ${3} Blackjack games.`,
        maxProgress: 3,
        reward: 10_000
    },
    bjWager: {
        description: `Wager ${(10_000).toLocaleString()} points in Blackjack games.`,
        maxProgress: 10_000,
        reward: 10_000
    },
    bjWin: {
        description: `Win ${2} Blackjack games.`,
        maxProgress: 2,
        reward: 10_000
    },
    bjProfit: {
        description: `Win ${(10_000).toLocaleString()} points in Blackjack games.`,
        maxProgress: 10_000,
        reward: 10_000
    },
    // Death Roll Dailies
    deathRollGame: {
        description: `Play ${1} Death Roll.`,
        maxProgress: 1,
        reward: 10_000
    },
    deathRollWager: {
        description: `Wager ${(25_000).toLocaleString()} points in Death Rolls.`,
        maxProgress: 25_000,
        reward: 10_000
    },
    deathRollWin: {
        description: `Win ${1} Death Roll.`,
        maxProgress: 1,
        reward: 10_000
    },
    deathRollProfit: {
        description: `Win ${(10_000).toLocaleString()} points in Death Rolls.`,
        maxProgress: 10_000,
        reward: 10_000
    },
    // Gamble Dailies
    gGame: {
        description: `Gamble ${5} times.`,
        maxProgress: 5,
        reward: 10_000
    },
    gWager: {
        description: `Gamble ${(50_000).toLocaleString()} points.`,
        maxProgress: 50_000,
        reward: 10_000
    },
    gWin: {
        description: `Gamble and win ${3} times.`,
        maxProgress: 3,
        reward: 10_000
    },
    gProfit: {
        description: `Gamble and win ${(10_000).toLocaleString()} points.`,
        maxProgress: 10_000,
        reward: 10_000
    },
    // Lottery Dailies
    lotteryBuy: {
        description: `Buy ${1} lottery ticket.`,
        maxProgress: 1,
        reward: 10_000
    },
    // Slots Dailies
    slotsGame: {
        description: `Play Slots ${5} times.`,
        maxProgress: 5,
        reward: 10_000
    },
    slotsWager: {
        description: `Wager ${(25_000).toLocaleString()} points in Slots.`,
        maxProgress: 25_000,
        reward: 10_000
    },
    slotsWin: {
        description: `Play Slots and profit ${2} times.`,
        maxProgress: 2,
        reward: 10_000
    },
    slotsProfit: {
        description: `Play Slots and win ${(10_000).toLocaleString()} points.`,
        maxProgress: 10_000,
        reward: 10_000
    },
    // Steal Dailies
    stealAttempt: {
        description: `Attempt to Steal from a user ${1} time.`,
        maxProgress: 1,
        reward: 10_000
    },
} as const;

export default dailies;
export { DailyId, Daily };