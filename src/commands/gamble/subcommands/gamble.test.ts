import { gamble } from './gamble';

beforeEach(() => {
    jest.spyOn(global.Math, 'random').mockReturnValue(0.5);
});

describe('gamble()', () => {
    describe('50%', () => {
        test('100 point, lose', () => {
            expect(gamble(100, 50)).toBe(-100);
        });
        test('100 point, win', () => {
            jest.spyOn(global.Math, 'random').mockReturnValue(0.25);
            expect(gamble(100, 50)).toBe(100);
        });
    });

    describe('30%', () => {
        test('100 point, lose', () => {
            expect(gamble(100, 30)).toBe(-100);
        });
        test('100 point, win', () => {
            jest.spyOn(global.Math, 'random').mockReturnValue(0.15);
            expect(gamble(100, 30)).toBe(234);
        });
    });

    describe('10%', () => {
        test('100 point, lose', () => {
            expect(gamble(100, 10)).toBe(-100);
        });
        test('100 point, win', () => {
            jest.spyOn(global.Math, 'random').mockReturnValue(0.05);
            expect(gamble(100, 10)).toBe(900);
        });
    });

    describe('1%', () => {
        test('100 point, lose', () => {
            expect(gamble(100, 1)).toBe(-100);
        });
        test('100 point, win', () => {
            jest.spyOn(global.Math, 'random').mockReturnValue(0.005);
            expect(gamble(100, 1)).toBe(9900);
        });
    });
});