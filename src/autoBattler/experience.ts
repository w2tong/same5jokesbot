const levelExp: {[level: number]: number} = {
    1: 100,
    2: 250,
    3: 500,
    4: 1000,
} as const;

const encounterExp: {[level: number]: number} = {
    1: 10,
    2: 20,
    3: 30,
    4: 40,
} as const;

export {levelExp, encounterExp};