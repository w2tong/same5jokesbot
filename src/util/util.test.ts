import { getRandomRange, dateToDbString, msToString, capitalize } from './util';

const mockDate = new Date('2023-01-01');
jest.useFakeTimers().setSystemTime(mockDate);

describe('getRandomRange()', () => {
    beforeEach(() => {
        jest.spyOn(global.Math, 'random').mockReturnValue(0.5);
    });
    test('0 is 0', () => {
        expect(getRandomRange(0)).toEqual(0);
    });
    test('1 is 0', () => {
        expect(getRandomRange(1)).toBe(0);
    });
    test('100 is 50', () => {
        expect(getRandomRange(100)).toBe(50);
    });
    test('1000 is 500', () => {
        expect(getRandomRange(1000)).toBe(500);
    });
    test('1,000,000 is 500,000', () => {
        expect(getRandomRange(1_000_000)).toBe(500_000);
    });
    test('-1 is -1', () => {
        expect(getRandomRange(-1)).toBe(-1);
    });
    test('100, lower range is 0', () => {
        jest.spyOn(global.Math, 'random').mockReturnValue(0);
        expect(getRandomRange(100)).toBe(0);
    });
    test('100, upper range is 100', () => {
        jest.spyOn(global.Math, 'random').mockReturnValue(1);
        expect(getRandomRange(100)).toBe(100);
    });
});

describe('dateToDbString()', () => {
    test('2023-01-01 is 2023-01-01 00:00:00', () => {
        const result = dateToDbString(new Date());
        expect(result).toBe('2023-01-01 00:00:00');
    });
});

describe('msToString()', () => {
    test('0 is 0d 0h 0m 0s', () => {
        expect(msToString(0)).toBe('0d 0h 0m 0s');
    });
    test('1 is 0d 0h 0m 0s', () => {
        expect(msToString(1)).toBe('0d 0h 0m 0s');
    });
    test('1000 is 0d 0h 0m 1s', () => {
        expect(msToString(1000)).toBe('0d 0h 0m 1s');
    });
    test('60000 is 0d 0h 1m 0s', () => {
        expect(msToString(60000)).toBe('0d 0h 1m 0s');
    });
    test('3600000 is 0d 1h 0m 0s', () => {
        expect(msToString(3600000)).toBe('0d 1h 0m 0s');
    });
    test('86400000 is 1d 0h 0m 0s', () => {
        expect(msToString(86400000)).toBe('1d 0h 0m 0s');
    });
    test('867810630 is 10d 1h 3m 30s', () => {
        expect(msToString(867810630)).toBe('10d 1h 3m 30s');
    });
});

describe('capitalize()', () => {
    test('empty string', () => {
        expect(capitalize('')).toBe('');
    });
    test('a is A', () => {
        expect(capitalize('a')).toBe('A');
    });
    test('A is A', () => {
        expect(capitalize('A')).toBe('A');
    });
    test('this is a phrase is This is a phrase', () => {
        expect(capitalize('this is a phrase')).toBe('This is a phrase');
    });
    test('-= is -=', () => {
        expect(capitalize('-=')).toBe('-=');
    });
});