import { CurrentDisperseStreak } from '../sql/current-disperse-streak';

const mockGetCurrentDisperseStreakResponse: CurrentDisperseStreak = {
    STREAK_DATE: '2023-01-01T00:00:00.000Z',
    USER_IDS: 'user1,user2,user3',
    STREAK: 3
};
async function mockGetCurrentDisperseStreak(): Promise<CurrentDisperseStreak> {
    return new Promise((resolve) => {
        resolve(mockGetCurrentDisperseStreakResponse);
    });
}

async function mockInsertDisperseStreakHighScore(): Promise<boolean> {
    return new Promise((resolve) => {
        resolve(true);
    });
}

export {
    mockGetCurrentDisperseStreak,
    mockInsertDisperseStreakHighScore
};