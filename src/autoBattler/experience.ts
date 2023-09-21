const levelExp: {[level: number]: number} = {
    1: 500,
    2: 1000,
    3: 2000,
    4: 4000,
} as const;

const encounterExp: {[level: number]: number} = {
    1: 25,
    2: 50,
    3: 75,
    4: 100,
} as const;

export {levelExp, encounterExp};