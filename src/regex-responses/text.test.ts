import getTextResponse from './text';

beforeAll(() => {
    jest.spyOn(global.Math, 'random').mockReturnValue(0.5);
});

afterAll(() => {
    jest.spyOn(global.Math, 'random').mockRestore();
});

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