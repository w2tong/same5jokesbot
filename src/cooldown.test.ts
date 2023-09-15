import { Cooldown, RewardCooldown } from './cooldown';
import * as sqlCringePoints from './sql/tables/cringe_points';
import { mockVoidPromise } from './tests/testUtil';

beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
});
afterAll(() => {
    jest.useRealTimers();
});

describe('Cooldown(0)', () => {
    test('1 user, 0 sec', () => {
        const cooldown = new Cooldown(0);
        cooldown.setCooldown('user1');
        expect(cooldown.onCooldown('user1')).toEqual(false);
    });
    test('1 user, 60 sec', () => {
        const duration = 60000;
        const cooldown = new Cooldown(duration);
        cooldown.setCooldown('user1');
        expect(cooldown.onCooldown('user1')).toEqual(true);
        jest.advanceTimersByTime(duration/2);
        expect(cooldown.onCooldown('user1')).toEqual(true);
        jest.advanceTimersToNextTimer();
        expect(cooldown.onCooldown('user1')).toEqual(false);
    });
    test('2 users, 60 sec', () => {
        const duration = 60000;
        const cooldown = new Cooldown(duration);
        cooldown.setCooldown('user1');
        expect(cooldown.onCooldown('user1')).toEqual(true);
        jest.advanceTimersByTime(duration/2);
        cooldown.setCooldown('user2');
        expect(cooldown.onCooldown('user1')).toEqual(true);
        expect(cooldown.onCooldown('user2')).toEqual(true);
        jest.advanceTimersToNextTimer();
        expect(cooldown.onCooldown('user1')).toEqual(false);
        expect(cooldown.onCooldown('user2')).toEqual(true);
    });
});

const updateCringePointsMock = jest.spyOn(sqlCringePoints, 'updateCringePoints').mockImplementation(mockVoidPromise);

describe('RewardCooldown()', () => {
    test('1 user, 0 sec, 100 points', () => {
        const cooldown = new RewardCooldown(0, 100);
        cooldown.reward('user1');
        expect(updateCringePointsMock.mock.lastCall).toEqual([[{userId: 'user1', points: 100}]]);
        expect(updateCringePointsMock.mock.calls.length).toEqual(1);
    });
    test('1 user, 60 sec, 100 points', () => {
        const duration = 60000;
        const cooldown = new RewardCooldown(duration, 100);
        cooldown.reward('user1');
        expect(updateCringePointsMock.mock.lastCall).toEqual([[{userId: 'user1', points: 100}]]);
        expect(updateCringePointsMock.mock.calls.length).toEqual(1);
        jest.advanceTimersByTime(duration/2);
        cooldown.reward('user1');
        expect(updateCringePointsMock.mock.calls.length).toEqual(1);
        jest.advanceTimersToNextTimer();
        cooldown.reward('user1');
        expect(updateCringePointsMock.mock.calls.length).toEqual(2);
        expect(updateCringePointsMock.mock.lastCall).toEqual([[{userId: 'user1', points: 100}]]);
    });
    test('2 users, 60 sec, 100 points', () => {
        const duration = 60000;
        const cooldown = new RewardCooldown(duration, 100);
        cooldown.reward('user1');
        expect(updateCringePointsMock.mock.calls).toEqual([[[{userId: 'user1', points: 100}]]]);
        jest.advanceTimersByTime(duration/2);
        cooldown.reward('user1');
        cooldown.reward('user2');
        expect(updateCringePointsMock.mock.calls).toEqual([
            [[{userId: 'user1', points: 100}]],
            [[{userId: 'user2', points: 100}]]
        ]);
        jest.advanceTimersToNextTimer();
        cooldown.reward('user1');
        cooldown.reward('user2');
        expect(updateCringePointsMock.mock.calls).toEqual([
            [[{userId: 'user1', points: 100}]],
            [[{userId: 'user2', points: 100}]],
            [[{userId: 'user1', points: 100}]]
        ]);
    });
});