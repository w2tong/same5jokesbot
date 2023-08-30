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
        description: `Play ${5} Blackjack games.`,
        maxProgress: 5,
        reward: 25_000
    },
    bjWager: {
        description: `Wager ${50_000} points in Blackjack games.`,
        maxProgress: 50_000,
        reward: 25_000
    },
    bjWin: {
        description: `Win ${3} Blackjack games.`,
        maxProgress: 3,
        reward: 25_000
    },
    bjProfit: {
        description: `Win ${(25_000).toLocaleString()} points in Blackjack games.`,
        maxProgress: 25_000,
        reward: 25_000
    },
    // Death Roll Dailies
    deathRollGame: {
        description: `Play ${1} Death Roll.`,
        maxProgress: 1,
        reward: 25_000
    },
    deathRollWager: {
        description: `Wager ${50_000} points in Death Rolls.`,
        maxProgress: 50_000,
        reward: 25_000
    },
    deathRollWin: {
        description: `Win ${1} Death Roll.`,
        maxProgress: 1,
        reward: 25_000
    },
    deathRollProfit: {
        description: `Win ${(25_000).toLocaleString()} points in Death Rolls.`,
        maxProgress: 25_000,
        reward: 25_000
    },
    // Gamble Dailies
    gGame: {
        description: `Gamble ${5} times.`,
        maxProgress: 5,
        reward: 25_000
    },
    gWager: {
        description: `Gamble ${50_000} points.`,
        maxProgress: 50_000,
        reward: 25_000
    },
    gWin: {
        description: `Gamble and win ${3} times.`,
        maxProgress: 3,
        reward: 25_000
    },
    gProfit: {
        description: `Gamble and win ${(25_000).toLocaleString()} points.`,
        maxProgress: 25_000,
        reward: 25_000
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
        reward: 25_000
    },
    slotsWager: {
        description: `Wager ${50_000} points in Slots.`,
        maxProgress: 50_000,
        reward: 25_000
    },
    slotsWin: {
        description: `Play Slots and win ${3} times.`,
        maxProgress: 3,
        reward: 25_000
    },
    slotsProfit: {
        description: `Play Slots and win ${(25_000).toLocaleString()} points.`,
        maxProgress: 25_000,
        reward: 25_000
    },
    // Steal Dailies
    stealAttempt: {
        description: `Attempt to Steal from a user ${1} time.`,
        maxProgress: 1,
        reward: 25_000
    },
} as const;

export default dailies;
export { DailyId, Daily };