import getTextResponse from './text';
import { mockGetCurrentDisperseStreak } from '../tests/mockQueryFunctions';
import * as sqlCurrentDisperseStreak from '../sql/current-disperse-streak';
import * as sqlDisperseStreakBreaks from '../sql/disperse-streak-breaks';
import * as sqlDisperseStreakHighscore from '../sql/disperse-streak-highscore';
import * as sqlGamerStats from '../sql/gamers-stats';

const mockDate = new Date('2023-01-01');
jest.useFakeTimers().setSystemTime(mockDate);
jest.spyOn(global.Math, 'random').mockReturnValue(0.5);

describe('Where\'s andy?', () => {
    test('empty string', async () => {
        const res = await getTextResponse('', '', '', '');
        expect(res).toBe('');
    });
    test('where\'s andy', async () => {
        const res = await getTextResponse('where\'s andy', '', '', '');
        expect(res).toBe('Washing his dishes.');
    });
    test('where is andy', async () => {
        const res = await getTextResponse('where is andy', '', '', '');
        expect(res).toBe('Washing his dishes.');
    });
    test('whereandy', async () => {
        const res = await getTextResponse('whereandy', '', '', '');
        expect(res).toBe('Washing his dishes.');
    });
});

describe('Translate', () => {
    test('empty string', async () => {
        const res = await getTextResponse('', '', '', '');
        expect(res).toBe('');
    });
    test('someone translate', async () => {
        const res = await getTextResponse('someone translate', '', '', '');
        expect(res).toBe('Boogie down');
    });
    test('translation please', async () => {
        const res = await getTextResponse('translation', '', '', '');
        expect(res).toBe('Boogie down');
    });
});

describe('Gamers', () => {

    jest.spyOn(sqlGamerStats, 'updateGamersStats').mockImplementation();
    jest.spyOn(sqlCurrentDisperseStreak, 'getCurrentDisperseStreak').mockImplementation(mockGetCurrentDisperseStreak);
    const mockUpdateCurrentDisperseStreak = jest.spyOn(sqlCurrentDisperseStreak, 'updateCurrentDisperseStreak').mockImplementation();
    let mockInsertDisperseStreakHighScore = jest.spyOn(sqlDisperseStreakHighscore, 'insertDisperseStreakHighScore').mockImplementation();
    const mockUpdateDisperseStreakBreaks = jest.spyOn(sqlDisperseStreakBreaks, 'updateDisperseStreakBreaks').mockImplementation();

    afterEach(() => {
        jest.spyOn(global.Math, 'random').mockReturnValue(0.5);
        mockInsertDisperseStreakHighScore = jest.spyOn(sqlDisperseStreakHighscore, 'insertDisperseStreakHighScore').mockImplementation();
    });
    
    test('empty string', async () => {
        const res = await getTextResponse('', '', '', '');
        expect(res).toBe('');
    });
    test('Rise up!', async () => {
        jest.spyOn(global.Math, 'random').mockReturnValue(0.1);
        const res = await getTextResponse('gamers', 'user-id', 'username', 'guild-id');
        expect(res).toBe('Rise up!\nDisperse Streak: **3** broken by **username**');
        expect(mockInsertDisperseStreakHighScore.mock.calls.length).toBe(0);
        expect(mockUpdateDisperseStreakBreaks.mock.lastCall).toEqual(['user-id', 3]);
        expect(mockUpdateCurrentDisperseStreak.mock.lastCall).toEqual(['guild-id', '2023-01-01 00:00:00', 'user-id', 0]);
    });
    test('Disperse!', async () => {
        jest.spyOn(sqlDisperseStreakHighscore, 'insertDisperseStreakHighScore').mockImplementation(() => { 
            return new Promise((resolve) => {
                resolve(true);
            });
        });
        const res = await getTextResponse('gamers', 'user-id', '', 'guild-id');
        expect(res).toBe('Disperse!\nNEW HIGHSCORE: **4** (or the same)');
        expect(mockUpdateCurrentDisperseStreak.mock.lastCall).toEqual(['guild-id', '2023-01-01 00:00:00', 'user1,user2,user3,user-id', 4]);
        expect(mockInsertDisperseStreakHighScore.mock.lastCall).toEqual(['guild-id', '2023-01-01 00:00:00', 'user1,user2,user3,user-id', 4]);
        expect(mockUpdateDisperseStreakBreaks.mock.calls.length).toBe(0);
    });
    test('Discharge!', async () => {
        jest.spyOn(global.Math, 'random').mockReturnValue(0.9);
        const res = await getTextResponse('gamers', 'user-id', 'username', 'guild-id');
        expect(res).toBe('Discharge!\nDisperse Streak: **3** broken by **username**');
        expect(mockInsertDisperseStreakHighScore.mock.calls.length).toBe(0);
        expect(mockUpdateDisperseStreakBreaks.mock.lastCall).toEqual(['user-id', 3]);
        expect(mockUpdateCurrentDisperseStreak.mock.lastCall).toEqual(['guild-id', '2023-01-01 00:00:00', 'user-id', 0]);
    });
});

describe('Bazinga!', () => {
    test('empty string', async () => {
        const res = await getTextResponse('', '', '', '');
        expect(res).toBe('');
    });
    test('white space', async () => {
        const res = await getTextResponse('   ', '', '', '');
        expect(res).toBe('');
    });
    test('bazinga', async () => {
        const res = await getTextResponse('bazinga', '', '', '');
        expect(res).toBe('Bazinga!');
    });
    test('zimbabwe', async () => {
        const res = await getTextResponse('zimbabwe', '', '', '');
        expect(res).toBe('Bazinga!');
    });
});

describe('Then go eat.', () => {
    test('empty string', async () => {
        const res = await getTextResponse('', '', '', '');
        expect(res).toBe('');
    });
    test('white space', async () => {
        const res = await getTextResponse('   ', '', '', '');
        expect(res).toBe('');
    });
    test('i\'m hungry', async () => {
        const res = await getTextResponse('i\'m hungry', '', '', '');
        expect(res).toBe('Then go eat.');
    });
    test('i\'m very hungry', async () => {
        const res = await getTextResponse('i\'m very hungry', '', '', '');
        expect(res).toBe('Then go eat.');
    });
    test('im hungry', async () => {
        const res = await getTextResponse('im hungry', '', '', '');
        expect(res).toBe('Then go eat.');
    });
    test('me hungy', async () => {
        const res = await getTextResponse('me hungy', '', '', '');
        expect(res).toBe('Then go eat.');
    });
});

describe('big|strong|handsome|tall|smart|rich|funny', () => {
    test('no words', async () => {
        const res = await getTextResponse('yo', '', '', '');
        expect(res).toBe('');
    });
    test('big', async () => {
        const res = await getTextResponse('big', '', '', '');
        expect(res).toBe('Strong, handsome, tall, smart, rich and funny.');
    });
    test('funny', async () => {
        const res = await getTextResponse('funny', '', '', '');
        expect(res).toBe('Big, strong, handsome, tall, smart and rich.');
    });
    test('strong, stall, smarty', async () => {
        const res = await getTextResponse('strong, stall, smarty', '', '', '');
        expect(res).toBe('Big, handsome, tall, smart, rich and funny.');
    });
    test('all words', async () => {
        const res = await getTextResponse('big strong handsome tall smart rich funny', '', '', '');
        expect(res).toBe('');
    });
});