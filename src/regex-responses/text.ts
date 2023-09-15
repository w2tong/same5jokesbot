import { Emotes, emotes } from '../util/emotes';
import { getCurrentDisperseStreak, updateCurrentDisperseStreak } from '../sql/tables/current_disperse_streak';
import { updateDisperseStreakBreaks } from '../sql/tables/disperse_streak_breaks';
import { insertDisperseStreakHighScore } from '../sql/tables/disperse_streak_highscore';
import { updateGamersStats } from '../sql/tables/gamers_stats';
import { getRandomRange } from '../util/util';
import { logError } from '../logger';
import { updateCringePoints } from '../sql/tables/cringe_points';
import { bold } from 'discord.js';

// Where is Andy random response
const verbs = ['Walking', 'Washing', 'Eating'];
const nouns = ['dog', 'dishes', 'dinner'];
function whereIsAndy(): string {
    const verb = verbs[getRandomRange(verbs.length)];
    const noun = nouns[getRandomRange(nouns.length)];
    return verb + ' his ' + noun + '.';
}

const translations = ['Prance forward', 'Shashay left', 'Boogie down', 'Shimmy right'];
function getTranslation(): string {
    return translations[getRandomRange(translations.length)];
}

const gamers = ['Rise up!', 'Disperse!', 'Discharge!'];
function getGamersResponse(): string {
    return gamers[getRandomRange(gamers.length)];
}

function getNextYear(): number {
    return new Date().getUTCFullYear() + 1;
}

const life = ['is Strange', 'is Peculiar', 'of Luxury'];
function getLifeAdjective(): string {
    return life[getRandomRange(life.length)];
}

const sonsOf = ['the Forest', 'Anarchy'];
function getSonsOf(): string {
    return sonsOf[getRandomRange(sonsOf.length)];
}

const DND = ['Dungeons and Dragons?', 'Dark and Darker?', 'Where\'s Albert?'];
function getDND(): string {
    return DND[getRandomRange(DND.length)];
}

const val = ['orant?', 'heim?'];
function getVal(): string {
    return val[getRandomRange(val.length)];
}

const wayneAction = ['Watching Westworld', 'Watching Better Call Saul', 'Watching Game of Thrones', 'Watching The Boys', 'Pathfinding', 'Kingmaking'];
function whereIsWayne(): string {
    return `${wayneAction[getRandomRange(wayneAction.length)]}.`;
}

const alam = ['will be readyt in like 25 mb', 'Nt try again tmr', 'great alam everybody'];
function getAlam(): string {
    return `${alam[getRandomRange(alam.length)]}`;
}

const disperseRewardBase = 1000;
const disperseRewardMultiplier = 4;

const regexToText = [
    {
        regex: /where.*andy/,
        getText: () => whereIsAndy()
    },
    {
        regex: /translat(e|ion)/,
        getText: () => getTranslation()
    },
    {
        regex: /^gamers$/,
        getText: async (_command: string, userId: string, username: string, guildId: string) => {
            let res = getGamersResponse();
            void updateGamersStats(userId, res);
            const disperseCurrentStreak = await getCurrentDisperseStreak(guildId);
            if (res === 'Disperse!') {
                const streak = disperseCurrentStreak.STREAK+1;
                if (streak > 1) {
                    await updateCringePoints([{userId, points: disperseRewardBase * (disperseRewardMultiplier ** (streak-2))}]);
                }
                const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
                const userIds = (disperseCurrentStreak.STREAK === 0) ? userId : `${disperseCurrentStreak.USER_IDS},${userId}`;
                void updateCurrentDisperseStreak(guildId, date, userIds, streak);
                const inserted = await insertDisperseStreakHighScore(guildId, date, userIds, streak);
                if (inserted) {
                    res = `${res}\nNEW HIGHSCORE: ${bold(`${streak}`)} (or the same)`;
                }
            }
            else {
                if (disperseCurrentStreak.STREAK > 1) {
                    res = `${res}\nDisperse Streak: ${bold(`${disperseCurrentStreak.STREAK}`)} broken by ${bold(username)}`;
                    void updateDisperseStreakBreaks(userId, disperseCurrentStreak.STREAK);
                }
                const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
                void updateCurrentDisperseStreak(guildId, date, userId, 0);
            }
            return res;
        }
    },
    {
        regex: /bazinga|zimbabwe/,
        getText: () => 'Bazinga!'
    },
    {
        regex: /(i'?m|me).*hungr?y/,
        getText: () => 'Then go eat.'
    },
    {
        regex: /oth(er|a).*side/,
        getText: () => 'The other what?'
    },
    {
        regex: /take?.*it.*bac?k/,
        getText: () => 'Now y\'all.'
    },
    {
        regex: /no.*shot/,
        getText: () => 'Shot.'
    },
    {
        regex: /(?<!no.*)shot/,
        getText: () => 'No shot.'
    },
    {
        regex: /\bfa(x|ct(s|ual))\b/,
        getText: () => 'No printer.'
    },
    {
        regex: /\bpam/,
        getText: () => 'PAM!'
    },
    {
        regex: /when.*andy.*get(ting)?.*new.*computer/,
        getText: () => getNextYear().toString()
    },
    {
        regex: /too.*late/,
        getText: () => 'But you promised.'
    },
    {
        regex: /hell\s*halt/,
        getText: () => `I'm a leak, I'm a leak. ${emotes[Emotes.Sadge]}`
    },
    {
        regex: /shut.*up/,
        getText: () => 'Smosh voice.'
    },
    {
        regex: /so.*troll?/,
        getText: () => 'Dyrus.'
    },
    {
        regex: /\bdyrus\b/,
        getText: () => 'So troll.'
    },
    {
        regex: /^\s*oh?\s*$/,
        getText: () => 'The misery.'
    },
    {
        regex: /^\s*no\s*$/,
        getText: () => 'IDONTTHINKSO.'
    },
    {
        regex: /\bl\b/,
        getText: () => '+ Ratio.'
    },
    {
        regex: /\b(win|won)\b/,
        getText: () => 'Boring.'
    },
    {
        regex: /\b(lose|lost)\b/,
        getText: () => 'Go agane.'
    },
    {
        regex: /\bboring\b/,
        getText: () => 'Don\'t care.'
    },
    {
        regex: /\bdon'?t.*care\b/,
        getText: () => 'Boring.'
    },
    {
        regex: /\bpl(ease|s|z)\b/,
        getText: () => '(with rizz)'
    },
    {
        regex: /\blife\b/,
        getText: () => `${getLifeAdjective()}.`
    },
    {
        regex: /\bsons\b/,
        getText: () => `of ${getSonsOf()}.`
    },
    {
        regex: /\bdark\b/,
        getText: () => 'and Darker.'
    },
    {
        regex: /\bdnd/,
        getText: () => getDND()
    },
    {
        regex: /\bval\b/,
        getText: () => getVal()
    },
    {
        regex: /\bgrind(ing|s)?.*gears?\b/,
        getText: () => 'Games.'
    },
    {
        regex: /\bha\s*ha\b/,
        getText: () => 'That\'s crazy.'
    },
    {
        regex: /\bthat('?s| is) crazy\b/,
        getText: () => 'Haha.'
    },
    {
        regex: /\bvoti|vault of the incarnates|vaati\b/,
        getText: () => 'Vidya.'
    },
    {
        regex: /\b(since|if) we('?re not| aren'?t) doing anything\b/,
        getText: () => 'I gotta go.'
    },
    {
        regex: /\bwhere.*wayne\b/,
        getText: () => whereIsWayne()
    },
    {
        regex: /\b(big|strong|handsome|tall|smart|rich|funny)\b/,
        getText: (command: string) => {
            const arr = ['big', 'strong', 'handsome', 'tall', 'smart', 'rich', 'funny'];
            let i = 0;
            while (i < arr.length) {
                const regex = new RegExp(`\\b${arr[i]}\\b`);
                if (regex.test(command)) arr.splice(i, 1);
                else i++;
            }
            let str = '';
            if (arr.length === 0) return '';
            if (arr.length === 1) str = arr[0];
            else str = `${arr.slice(0, -1).join(', ')} and ${arr[arr.length-1]}`;
            return `${str.charAt(0).toUpperCase()}${str.slice(1)}.`;
        }
    },
    {
        regex: /\balam/,
        getText: () => getAlam()
    }
];

export default async (command: string, userId: string, username: string, guildId: string): Promise<string> => {
    const botMessage = [];
    for (const regexText of regexToText) {
        if (regexText.regex.test(command)) {
            try {
                const text = await regexText.getText(command, userId, username, guildId);
                if (text.length) botMessage.push(text);
            } catch(err) {
                logError(err);
            }
        }
    }
    return botMessage.join('\n');
};