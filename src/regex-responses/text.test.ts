import getTextResponse from './text';
import { mockGetCurrentDisperseStreakZero, mockGetCurrentDisperseStreakThree } from '../tests/mockQueryFunctions';
import * as sqlCurrentDisperseStreak from '../sql/tables/current-disperse-streak';
import * as sqlDisperseStreakBreaks from '../sql/tables/disperse-streak-breaks';
import * as sqlDisperseStreakHighscore from '../sql/tables/disperse-streak-highscore';
import * as sqlGamerStats from '../sql/tables/gamers-stats';
import { Emotes, emotes } from '../util/emotes';
import * as logger from '../logger';
import { mockVoidPromise, mockTruePromise, mockFalsePromise } from '../tests/testUtil';

const mockDate = new Date('2023-01-01');
jest.useFakeTimers().setSystemTime(mockDate);
jest.spyOn(global.Math, 'random').mockReturnValue(0.5);

beforeAll(() => {
    logger.logger.silent = true;
});
afterAll(() => {
    logger.logger.silent = false;
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

describe('Gamers', () => {

    jest.spyOn(sqlGamerStats, 'updateGamersStats').mockImplementation(mockVoidPromise);
    jest.spyOn(sqlCurrentDisperseStreak, 'getCurrentDisperseStreak').mockImplementation(mockGetCurrentDisperseStreakThree);
    const mockUpdateCurrentDisperseStreak = jest.spyOn(sqlCurrentDisperseStreak, 'updateCurrentDisperseStreak').mockImplementation(mockVoidPromise);
    let mockInsertDisperseStreakHighScore = jest.spyOn(sqlDisperseStreakHighscore, 'insertDisperseStreakHighScore').mockImplementation(mockFalsePromise);
    const mockUpdateDisperseStreakBreaks = jest.spyOn(sqlDisperseStreakBreaks, 'updateDisperseStreakBreaks').mockImplementation(mockVoidPromise);

    afterEach(() => {
        jest.spyOn(global.Math, 'random').mockReturnValue(0.5);
        jest.spyOn(sqlCurrentDisperseStreak, 'getCurrentDisperseStreak').mockImplementation(mockGetCurrentDisperseStreakThree);
        mockInsertDisperseStreakHighScore = jest.spyOn(sqlDisperseStreakHighscore, 'insertDisperseStreakHighScore').mockImplementation(mockFalsePromise);
    });
    
    test('empty string', async () => {
        const res = await getTextResponse('', '', '', '');
        expect(res).toBe('');
    });
    test('hello gamers', async () => {
        const res = await getTextResponse('hello gamers', '', '', '');
        expect(res).toBe('');
    });
    test('Rise up!', async () => {
        jest.spyOn(global.Math, 'random').mockReturnValue(0.1);
        const res = await getTextResponse('gamers', 'user-id', 'username', 'guild-id');
        expect(res).toBe('Rise up!\nDisperse Streak: **3** broken by **username**');
        expect(mockInsertDisperseStreakHighScore).toBeCalledTimes(0);
        expect(mockUpdateDisperseStreakBreaks.mock.lastCall).toEqual(['user-id', 3]);
        expect(mockUpdateCurrentDisperseStreak.mock.lastCall).toEqual(['guild-id', '2023-01-01 00:00:00', 'user-id', 0]);
    });
    test('Disperse! zero streak', async () => {
        jest.spyOn(sqlCurrentDisperseStreak, 'getCurrentDisperseStreak').mockImplementation(mockGetCurrentDisperseStreakZero);
        const res = await getTextResponse('gamers', 'user-id', '', 'guild-id');
        expect(res).toBe('Disperse!');
        expect(mockUpdateCurrentDisperseStreak.mock.lastCall).toEqual(['guild-id', '2023-01-01 00:00:00', 'user-id', 1]);
        expect(mockInsertDisperseStreakHighScore.mock.lastCall).toEqual(['guild-id', '2023-01-01 00:00:00', 'user-id', 1]);
        expect(mockUpdateDisperseStreakBreaks).toBeCalledTimes(0);
    });
    test('Disperse! three streak', async () => {
        jest.spyOn(sqlDisperseStreakHighscore, 'insertDisperseStreakHighScore').mockImplementation(mockTruePromise);
        const res = await getTextResponse('gamers', 'user-id', '', 'guild-id');
        expect(res).toBe('Disperse!\nNEW HIGHSCORE: **4** (or the same)');
        expect(mockUpdateCurrentDisperseStreak.mock.lastCall).toEqual(['guild-id', '2023-01-01 00:00:00', 'user1,user2,user3,user-id', 4]);
        expect(mockInsertDisperseStreakHighScore.mock.lastCall).toEqual(['guild-id', '2023-01-01 00:00:00', 'user1,user2,user3,user-id', 4]);
        expect(mockUpdateDisperseStreakBreaks).toBeCalledTimes(0);
    });
    test('Discharge!', async () => {
        jest.spyOn(global.Math, 'random').mockReturnValue(0.9);
        const res = await getTextResponse('gamers', 'user-id', 'username', 'guild-id');
        expect(res).toBe('Discharge!\nDisperse Streak: **3** broken by **username**');
        expect(mockInsertDisperseStreakHighScore).toBeCalledTimes(0);
        expect(mockUpdateDisperseStreakBreaks.mock.lastCall).toEqual(['user-id', 3]);
        expect(mockUpdateCurrentDisperseStreak.mock.lastCall).toEqual(['guild-id', '2023-01-01 00:00:00', 'user-id', 0]);
    });
    test('throw error', async () => {
        jest.spyOn(sqlDisperseStreakHighscore, 'insertDisperseStreakHighScore').mockImplementation(() => {
            throw new Error('test error');
        });
        const loggerSpy = jest.spyOn(logger, 'logError');
        await getTextResponse('gamers', 'user-id', '', 'guild-id');
        expect(loggerSpy).toBeCalledTimes(1);
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

describe('I\'m hungry. Then go eat.', () => {
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

describe('Other side', () => {
    test('other side', async () => {
        const res = await getTextResponse('other side', '', '', '');
        expect(res).toBe('The other what?');
    });
    test('the other side', async () => {
        const res = await getTextResponse('the other side', '', '', '');
        expect(res).toBe('The other what?');
    });
    test('otha side', async () => {
        const res = await getTextResponse('otha side', '', '', '');
        expect(res).toBe('The other what?');
    });
    test('the othaside', async () => {
        const res = await getTextResponse('the othaside', '', '', '');
        expect(res).toBe('The other what?');
    });
});

describe('Take it back now y\'all', () => {
    test('take it back', async () => {
        const res = await getTextResponse('take it back', '', '', '');
        expect(res).toBe('Now y\'all.');
    });
    test('take it frickin back', async () => {
        const res = await getTextResponse('take it frickin back', '', '', '');
        expect(res).toBe('Now y\'all.');
    });
    test('tak it bak', async () => {
        const res = await getTextResponse('tak it bak', '', '', '');
        expect(res).toBe('Now y\'all.');
    });
});

describe('No shot. Shot', () => {
    test('no shot', async () => {
        const res = await getTextResponse('no shot', '', '', '');
        expect(res).toBe('Shot.');
    });
    test('no frickin shot', async () => {
        const res = await getTextResponse('no frickin shot', '', '', '');
        expect(res).toBe('Shot.');
    });
});

describe('Shot. No shot.', () => {
    test('shot', async () => {
        const res = await getTextResponse('shot', '', '', '');
        expect(res).toBe('No shot.');
    });
    test('frickin shot', async () => {
        const res = await getTextResponse('frickin shot', '', '', '');
        expect(res).toBe('No shot.');
    });
});

describe('Fax. No printer.', () => {
    test('fax', async () => {
        const res = await getTextResponse('fax', '', '', '');
        expect(res).toBe('No printer.');
    });
    test('facts', async () => {
        const res = await getTextResponse('facts', '', '', '');
        expect(res).toBe('No printer.');
    });
    test('factual', async () => {
        const res = await getTextResponse('factual', '', '', '');
        expect(res).toBe('No printer.');
    });
    test('fact', async () => {
        const res = await getTextResponse('fact', '', '', '');
        expect(res).toBe('');
    });
    test('faxual', async () => {
        const res = await getTextResponse('faxual', '', '', '');
        expect(res).toBe('');
    });
    test('faxtual', async () => {
        const res = await getTextResponse('faxtual', '', '', '');
        expect(res).toBe('');
    });
});

describe('PAM!', () => {
    test('pam', async () => {
        const res = await getTextResponse('pam', '', '', '');
        expect(res).toBe('PAM!');
    });
    test(' pammers!', async () => {
        const res = await getTextResponse('pammers!', '', '', '');
        expect(res).toBe('PAM!');
    });
    test('spammers!', async () => {
        const res = await getTextResponse('spammers!', '', '', '');
        expect(res).toBe('');
    });
});

describe('When\'s Andy getting a new computer?', () => {
    test('when\'s andy getting a new computer?', async () => {
        const res = await getTextResponse('when\'s andy getting a new computer?', '', '', '');
        expect(res).toBe('2024');
    });
    test('when andy get new computer', async () => {
        const res = await getTextResponse('when andy get new computer', '', '', '');
        expect(res).toBe('2024');
    });
});

describe('Too late. But you promised.', () => {
    test('too late', async () => {
        const res = await getTextResponse('too late', '', '', '');
        expect(res).toBe('But you promised.');
    });
    test('its too darn late', async () => {
        const res = await getTextResponse('its too darn late', '', '', '');
        expect(res).toBe('But you promised.');
    });
});

describe('Hellhalt. I\'m a leak, I\'m a leak.', () => {
    jest.replaceProperty(emotes, Emotes.Sadge, '😔');
    test('hellhalt', async () => {
        const res = await getTextResponse('hellhalt', '', '', '');
        expect(res).toBe('I\'m a leak, I\'m a leak. 😔');
    });
    test('hell   halt', async () => {
        const res = await getTextResponse('hell   halt', '', '', '');
        expect(res).toBe('I\'m a leak, I\'m a leak. 😔');
    });
    test('any hellhalters?!', async () => {
        const res = await getTextResponse('any hellhalters?!', '', '', '');
        expect(res).toBe('I\'m a leak, I\'m a leak. 😔');
    });
    test('hell ???  halt', async () => {
        const res = await getTextResponse('hell ???  halt', '', '', '');
        expect(res).toBe('');
    });
});

describe('Shut up. Smosh voice.', () => {
    test('shut up!', async () => {
        const res = await getTextResponse('shut up!', '', '', '');
        expect(res).toBe('Smosh voice.');
    });
    test('shutup', async () => {
        const res = await getTextResponse('shutup', '', '', '');
        expect(res).toBe('Smosh voice.');
    });
    test('shut the heck up!!!', async () => {
        const res = await getTextResponse('shut the heck up!!!', '', '', '');
        expect(res).toBe('Smosh voice.');
    });
});

describe('So troll. Dyrus.', () => {
    test('so troll', async () => {
        const res = await getTextResponse('so troll', '', '', '');
        expect(res).toBe('Dyrus.');
    });
    test('so trol', async () => {
        const res = await getTextResponse('so trol', '', '', '');
        expect(res).toBe('Dyrus.');
    });
    test('thats so trollerdog', async () => {
        const res = await getTextResponse('thats so trollerdog', '', '', '');
        expect(res).toBe('Dyrus.');
    });
});

describe('Dyrus. So troll.', () => {
    test('dyrus', async () => {
        const res = await getTextResponse('dyrus', '', '', '');
        expect(res).toBe('So troll.');
    });
    test(' dyrus ', async () => {
        const res = await getTextResponse(' dyrus ', '', '', '');
        expect(res).toBe('So troll.');
    });
    test('hey dyrus', async () => {
        const res = await getTextResponse(' dyrus ', '', '', '');
        expect(res).toBe('So troll.');
    });
});

describe('Oh. The misery.', () => {
    test('oh', async () => {
        const res = await getTextResponse('oh', '', '', '');
        expect(res).toBe('The misery.');
    });
    test('o', async () => {
        const res = await getTextResponse('o', '', '', '');
        expect(res).toBe('The misery.');
    });
    test(' o  ', async () => {
        const res = await getTextResponse(' o  ', '', '', '');
        expect(res).toBe('The misery.');
    });
    test('oh my glob', async () => {
        const res = await getTextResponse('oh my glob', '', '', '');
        expect(res).toBe('');
    });
});

describe('NOIDONTTHINKSO', () => {
    test('no', async () => {
        const res = await getTextResponse('no', '', '', '');
        expect(res).toBe('IDONTTHINKSO.');
    });
    test(' no ', async () => {
        const res = await getTextResponse(' no ', '', '', '');
        expect(res).toBe('IDONTTHINKSO.');
    });
    test('no shot', async () => {
        const res = await getTextResponse('no shot', '', '', '');
        expect(res).not.toBe('IDONTTHINKSO.');
    });
});

describe('L + Ratio.', () => {
    test('l', async () => {
        const res = await getTextResponse('l', '', '', '');
        expect(res).toBe('+ Ratio.');
    });
    test(' l ', async () => {
        const res = await getTextResponse(' l ', '', '', '');
        expect(res).toBe('+ Ratio.');
    });
    test('take this l loser', async () => {
        const res = await getTextResponse('take this l loser', '', '', '');
        expect(res).toBe('+ Ratio.');
    });
    test('lol!', async () => {
        const res = await getTextResponse('lol!', '', '', '');
        expect(res).toBe('');
    });
});

describe('Won|Win. Boring.', () => {
    test('we won!', async () => {
        const res = await getTextResponse('we won!', '', '', '');
        expect(res).toBe('Boring.');
    });
    test('any first win', async () => {
        const res = await getTextResponse('any first win', '', '', '');
        expect(res).toBe('Boring.');
    });
});

describe('Lose|Lost. Go agane.', () => {
    test('we lost', async () => {
        const res = await getTextResponse('we lost', '', '', '');
        expect(res).toBe('Go agane.');
    });
    test(' lose ', async () => {
        const res = await getTextResponse(' lose ', '', '', '');
        expect(res).toBe('Go agane.');
    });
});

describe('Boring. Don\'t care.', () => {
    test('boring', async () => {
        const res = await getTextResponse('boring', '', '', '');
        expect(res).toBe('Don\'t care.');
    });
    test('this is boring', async () => {
        const res = await getTextResponse('this is boring', '', '', '');
        expect(res).toBe('Don\'t care.');
    });
});

describe('Don\'t care. Boring.', () => {
    test('dont care', async () => {
        const res = await getTextResponse('dont care', '', '', '');
        expect(res).toBe('Boring.');
    });
    test('i dont care!', async () => {
        const res = await getTextResponse('i dont care', '', '', '');
        expect(res).toBe('Boring.');
    });
    test('dont fricking care!', async () => {
        const res = await getTextResponse('dont fricking care!', '', '', '');
        expect(res).toBe('Boring.');
    });
});

describe('Please (with rizz)', () => {
    test('please', async () => {
        const res = await getTextResponse('please', '', '', '');
        expect(res).toBe('(with rizz)');
    });
    test('pls', async () => {
        const res = await getTextResponse('pls', '', '', '');
        expect(res).toBe('(with rizz)');
    });
    test('plz', async () => {
        const res = await getTextResponse('plz', '', '', '');
        expect(res).toBe('(with rizz)');
    });
    test('pls go out with me', async () => {
        const res = await getTextResponse('pls go out with me', '', '', '');
        expect(res).toBe('(with rizz)');
    });
});

describe('Life', () => {
    test('life', async () => {
        const res = await getTextResponse('life', '', '', '');
        expect(res).toBe('is Peculiar.');
    });
    test('i guess you could say life...', async () => {
        const res = await getTextResponse('i guess you could say life...', '', '', '');
        expect(res).toBe('is Peculiar.');
    });
});

describe('Sons of', () => {
    test('sons', async () => {
        const res = await getTextResponse('sons', '', '', '');
        expect(res).toBe('of Anarchy.');
    });
    test(' sons ', async () => {
        const res = await getTextResponse(' sons ', '', '', '');
        expect(res).toBe('of Anarchy.');
    });
    test('any sons?', async () => {
        const res = await getTextResponse('any sons?', '', '', '');
        expect(res).toBe('of Anarchy.');
    });
});

describe('Dark', () => {
    test('dark', async () => {
        const res = await getTextResponse('dark', '', '', '');
        expect(res).toBe('and Darker.');
    });
    test(' dark ', async () => {
        const res = await getTextResponse(' dark ', '', '', '');
        expect(res).toBe('and Darker.');
    });
    test(' dark?', async () => {
        const res = await getTextResponse(' dark?', '', '', '');
        expect(res).toBe('and Darker.');
    });
});

describe('DND', () => {
    test('dnd', async () => {
        const res = await getTextResponse('dnd', '', '', '');
        expect(res).toBe('Dark and Darker?');
    });
    test('any dnders?', async () => {
        const res = await getTextResponse('any dnders?', '', '', '');
        expect(res).toBe('Dark and Darker?');
    });
});

describe('Val', () => {
    test('val', async () => {
        const res = await getTextResponse('val', '', '', '');
        expect(res).toBe('heim?');
    });
    test('anyone want to play val?', async () => {
        const res = await getTextResponse('anyone want to play val?', '', '', '');
        expect(res).toBe('heim?');
    });
});

describe('Grinding Gear Games', () => {
    test('grinding gear', async () => {
        const res = await getTextResponse('grinding gear', '', '', '');
        expect(res).toBe('Games.');
    });
    test('that grinds my gears', async () => {
        const res = await getTextResponse('that grinds my gears', '', '', '');
        expect(res).toBe('Games.');
    });
    test('grind gear', async () => {
        const res = await getTextResponse('grind gear', '', '', '');
        expect(res).toBe('Games.');
    });
});

describe('Haha. That\'s crazy.', () => {
    test('haha', async () => {
        const res = await getTextResponse('haha', '', '', '');
        expect(res).toBe('That\'s crazy.');
    });
    test('ha ha!', async () => {
        const res = await getTextResponse('ha ha!', '', '', '');
        expect(res).toBe('That\'s crazy.');
    });
});

describe('That\'s crazy. Haha.', () => {
    test('that\'s crazy', async () => {
        const res = await getTextResponse('that\'s crazy', '', '', '');
        expect(res).toBe('Haha.');
    });
    test('thats crazy', async () => {
        const res = await getTextResponse('thats crazy', '', '', '');
        expect(res).toBe('Haha.');
    });
    test('wow that is crazy!', async () => {
        const res = await getTextResponse('wow that is crazy!', '', '', '');
        expect(res).toBe('Haha.');
    });
    test('wow that\'s is crazy!', async () => {
        const res = await getTextResponse('wow that\'s is crazy!', '', '', '');
        expect(res).toBe('');
    });
});

describe('Voti|Vaati Vidya', () => {
    test('voti', async () => {
        const res = await getTextResponse('voti', '', '', '');
        expect(res).toBe('Vidya.');
    });
    test('vault of the incarnates', async () => {
        const res = await getTextResponse('vault of the incarnates', '', '', '');
        expect(res).toBe('Vidya.');
    });
    test('vaati', async () => {
        const res = await getTextResponse('vaati', '', '', '');
        expect(res).toBe('Vidya.');
    });
    test('anyone want to run voti?', async () => {
        const res = await getTextResponse('anyone want to run voti?', '', '', '');
        expect(res).toBe('Vidya.');
    });
    test(' who wants to watch vaati ', async () => {
        const res = await getTextResponse(' who wants to watch vaati ', '', '', '');
        expect(res).toBe('Vidya.');
    });
});

describe('I gotta go.', () => {
    test('since we\'re not doing anything', async () => {
        const res = await getTextResponse('since we\'re not doing anything', '', '', '');
        expect(res).toBe('I gotta go.');
    });
    test('well since were not doing anything', async () => {
        const res = await getTextResponse('well since were not doing anything', '', '', '');
        expect(res).toBe('I gotta go.');
    });
    test('well if we aren\'t doing anything', async () => {
        const res = await getTextResponse('well if we aren\'t doing anything', '', '', '');
        expect(res).toBe('I gotta go.');
    });
    test('if we arent doing anything', async () => {
        const res = await getTextResponse('if we arent doing anything', '', '', '');
        expect(res).toBe('I gotta go.');
    });
    test('since were arent doing anything', async () => {
        const res = await getTextResponse('since were arent doing anything', '', '', '');
        expect(res).toBe('');
    });
});

describe('Where\'s Wayne', () => {
    test('where\'s wayne', async () => {
        const res = await getTextResponse('where\'s wayne', '', '', '');
        expect(res).toBe('Watching The Boys.');
    });
    test('where wayne', async () => {
        const res = await getTextResponse('where wayne', '', '', '');
        expect(res).toBe('Watching The Boys.');
    });
    test('where is wayne', async () => {
        const res = await getTextResponse('where is wayne', '', '', '');
        expect(res).toBe('Watching The Boys.');
    });
    test('where the heck is wayne?', async () => {
        const res = await getTextResponse('where the heck is wayne?', '', '', '');
        expect(res).toBe('Watching The Boys.');
    });
});

describe('alam', () => {
    test('alam', async () => {
        const res = await getTextResponse('alam', '', '', '');
        expect(res).toBe('Nt try again tmr');
    });
    test('alam?', async () => {
        const res = await getTextResponse('alam?', '', '', '');
        expect(res).toBe('Nt try again tmr');
    });
    test('any alamers', async () => {
        const res = await getTextResponse('any alamers', '', '', '');
        expect(res).toBe('Nt try again tmr');
    });
});

describe('', () => {
    test('', async () => {
        const res = await getTextResponse('', '', '', '');
        expect(res).toBe('');
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
    test('all words but funny', async () => {
        const res = await getTextResponse('big strong handsome tall smart rich', '', '', '');
        expect(res).toBe('Funny.');
    });
    test('all words', async () => {
        const res = await getTextResponse('big strong handsome tall smart rich funny', '', '', '');
        expect(res).toBe('');
    });
});