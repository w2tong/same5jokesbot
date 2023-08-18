import { calculateDailyTax } from './taxes-welfare';

describe('userJoin()', () => {
    test('0 is 0', () => {
        expect(calculateDailyTax(0)).toEqual(0);
    });
    test('100,000 is 0', () => {
        expect(calculateDailyTax(100_000)).toEqual(0);
    });
    test('150,000 is 500', () => {
        expect(calculateDailyTax(150_000)).toEqual(500);
    });
    test('250,000 is 1,500', () => {
        expect(calculateDailyTax(250_000)).toEqual(1_500);
    });
    test('350,000 is 3,500', () => {
        expect(calculateDailyTax(350_000)).toEqual(3_500);
    });
    test('500,000 is 6,500', () => {
        expect(calculateDailyTax(500_000)).toEqual(6_500);
    });
    test('750,000 is 14,000', () => {
        expect(calculateDailyTax(750_000)).toEqual(14_000);
    });
    test('1,000,000 is 21,500', () => {
        expect(calculateDailyTax(1_000_000)).toEqual(21_500);
    });
    test('2,500,000 is 81,500', () => {
        expect(calculateDailyTax(2_500_000)).toEqual(81_500);
    });
    test('5,000,000 is 206,500', () => {
        expect(calculateDailyTax(5_000_000)).toEqual(206_500);
    });
    test('10,000,000 is 506,500', () => {
        expect(calculateDailyTax(10_000_000)).toEqual(506_500);
    });
    test('25,000,000 is 1,556,500', () => {
        expect(calculateDailyTax(25_000_000)).toEqual(1_556_500);
    });
    test('50,000,000 is 3,556,500', () => {
        expect(calculateDailyTax(50_000_000)).toEqual(3_556_500);
    });
    test('100,000,000 is 8,056,500', () => {
        expect(calculateDailyTax(100_000_000)).toEqual(8_056_500);
    });
    test('250,000,000 is 23,056,500', () => {
        expect(calculateDailyTax(250_000_000)).toEqual(23_056_500);
    });
    test('500,000,000 is 50,556,500', () => {
        expect(calculateDailyTax(500_000_000)).toEqual(50_556_500);
    });
    test('1,000,000,000 is 110,556,500', () => {
        expect(calculateDailyTax(1_000_000_000)).toEqual(110_556_500);
    });
    // Edge case
    test('-1,000,000 is 0', () => {
        expect(calculateDailyTax(-1_000_000)).toEqual(0);
    });
});