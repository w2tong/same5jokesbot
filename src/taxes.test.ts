import { calculateDailyTax } from './taxes';

describe('userJoin()', () => {
    test('0 is 0', () => {
        expect(calculateDailyTax(0)).toEqual(0);
    });
    test('100,000 is 0', () => {
        expect(calculateDailyTax(100_000)).toEqual(0);
    });
    test('150,000 is 250', () => {
        expect(calculateDailyTax(150_000)).toEqual(250);
    });
    test('250,000 is 750', () => {
        expect(calculateDailyTax(250_000)).toEqual(750);
    });
    test('350,000 is 1,750', () => {
        expect(calculateDailyTax(350_000)).toEqual(1_750);
    });
    test('500,000 is 3,250', () => {
        expect(calculateDailyTax(500_000)).toEqual(3_250);
    });
    test('750,000 is 7,000', () => {
        expect(calculateDailyTax(750_000)).toEqual(7_000);
    });
    test('1,000,000 is 10,750', () => {
        expect(calculateDailyTax(1_000_000)).toEqual(10_750);
    });
    test('2,500,000 is 40,750', () => {
        expect(calculateDailyTax(2_500_000)).toEqual(40_750);
    });
    test('5,000,000 is 103,250', () => {
        expect(calculateDailyTax(5_000_000)).toEqual(103_250);
    });
    test('10,000,000 is 253,250', () => {
        expect(calculateDailyTax(10_000_000)).toEqual(253_250);
    });
    test('25,000,000 is 778,250', () => {
        expect(calculateDailyTax(25_000_000)).toEqual(778_250);
    });
    test('50,000,000 is 1,778,250', () => {
        expect(calculateDailyTax(50_000_000)).toEqual(1_778_250);
    });
    test('100,000,000 is 4,028,250', () => {
        expect(calculateDailyTax(100_000_000)).toEqual(4_028_250);
    });
    test('250,000,000 is 11,528,250', () => {
        expect(calculateDailyTax(250_000_000)).toEqual(11_528_250);
    });
    test('500,000,000 is 25,278,250', () => {
        expect(calculateDailyTax(500_000_000)).toEqual(25_278_250);
    });
    test('1,000,000,000 is 55,278,250', () => {
        expect(calculateDailyTax(1_000_000_000)).toEqual(55_278_250);
    });
    // Edge case
    test('-1,000,000 is 0', () => {
        expect(calculateDailyTax(-1_000_000)).toEqual(0);
    });
});