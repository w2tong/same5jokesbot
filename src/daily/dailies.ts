type DailyId =  'bjGame' | 'bjWin' | 'bjProfit' |
                'gGame' | 'gWin' | 'gProfit' |
                'lotteryBuy' |
                'slotsGame' | 'slotsWin' | 'slotsProfit'
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
    bjWin: {
        description: `Win ${3} Blackjack games.`,
        maxProgress: 3,
        reward: 25_000
    },
    bjProfit: {
        description: `Win ${(100_000).toLocaleString()} points in Blackjack games.`,
        maxProgress: 100_000,
        reward: 25_000
    },
    // Gamble Dailies
    gGame: {
        description: `Gamble ${5} times.`,
        maxProgress: 5,
        reward: 25_000
    },
    gWin: {
        description: `Gamble and win ${3} times.`,
        maxProgress: 3,
        reward: 25_000
    },
    gProfit: {
        description: `Gamble and win ${(100_000).toLocaleString()} points.`,
        maxProgress: 100_000,
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
    slotsWin: {
        description: `Play Slots and win ${3} times.`,
        maxProgress: 3,
        reward: 25_000
    },
    slotsProfit: {
        description: `Play Slots and win ${(100_000).toLocaleString()} points.`,
        maxProgress: 100_000,
        reward: 25_000
    }
} as const;

export default dailies;
export { DailyId, Daily };