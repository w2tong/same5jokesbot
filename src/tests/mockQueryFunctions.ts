import { CurrentDisperseStreak } from '../sql/tables/current_disperse_streak';

const mockGetCurrentDisperseStreakResponseZero: CurrentDisperseStreak = {
    STREAK_DATE: '2023-01-01T00:00:00.000Z',
    USER_IDS: '',
    STREAK: 0
};
async function mockGetCurrentDisperseStreakZero(): Promise<CurrentDisperseStreak> {
    return new Promise((resolve) => {
        resolve(mockGetCurrentDisperseStreakResponseZero);
    });
}

const mockGetCurrentDisperseStreakResponseThree: CurrentDisperseStreak = {
    STREAK_DATE: '2023-01-01T00:00:00.000Z',
    USER_IDS: 'user1,user2,user3',
    STREAK: 3
};
async function mockGetCurrentDisperseStreakThree(): Promise<CurrentDisperseStreak> {
    return new Promise((resolve) => {
        resolve(mockGetCurrentDisperseStreakResponseThree);
    });
}

async function mockInsertDisperseStreakHighScore(): Promise<boolean> {
    return new Promise((resolve) => {
        resolve(true);
    });
}

export {
    mockGetCurrentDisperseStreakZero,
    mockGetCurrentDisperseStreakThree,
    mockInsertDisperseStreakHighScore
};