const levelExp: {[level: number]: number} = {
    1: 1000,
    2: 2000,
    3: 4000,
    4: 16000,
    5: 32000,
} as const;

const encounterExp: {[level: number]: number} = {
    1: 25,
    2: 50,
    3: 75,
    4: 100,
    5: 125
} as const;

export {levelExp, encounterExp};