import { emotes } from '../emotes';
import { getCurrentDisperseStreak, updateCurrentDisperseStreak } from '../sql/current-disperse-streak';
import { updateDisperseStreakBreaks } from '../sql/disperse-streak-breaks';
import { updateDisperseStreakHighScore } from '../sql/disperse-streak-highscore';
import { updateGamersStats } from '../sql/gamers-stats';
import { getRandomRange } from '../util';
import { logError } from '../logger';

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
    return new Date().getFullYear() + 1;
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
                const userIds = (disperseCurrentStreak.STREAK === 0) ? userId : `${disperseCurrentStreak.USER_IDS},${userId}`;
                void updateCurrentDisperseStreak(guildId, userIds, disperseCurrentStreak.STREAK+1);
                void updateDisperseStreakHighScore(guildId, userIds, disperseCurrentStreak.STREAK+1);
            }
            else {
                if (disperseCurrentStreak.STREAK > 1) {
                    res = `${res}\nDisperse Streak: **${disperseCurrentStreak.STREAK}** broken by **${username}**`;
                    void updateDisperseStreakBreaks(userId, disperseCurrentStreak.STREAK);
                }
                void updateCurrentDisperseStreak(guildId, userId, 0);
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
        regex: /fa(x|ct(s|ual))/,
        getText: () => 'No printer.'
    },
    {
        regex: /pam/,
        getText: () => 'PAM!'
    },
    {
        regex: /when.*andy.*get(ting)?.*new.*computer/,
        getText: () => getNextYear()
    },
    {
        regex: /too.*late/,
        getText: () => 'But you promised.'
    },
    {
        regex: /hell\s*halt/,
        getText: () => `I'm a leak, I'm a leak. ${emotes.sadge.toString()}`
        
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
        regex: /dyrus/,
        getText: () => 'So troll.'
    },
    {
        regex: /\boh?\b/,
        getText: () => 'The misery.'
    },
    {
        regex: /\bno\b(?!.*shot)/,
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
        regex: /boring/,
        getText: () => 'Don\'t care.'
    },
    {
        regex: /don'?t care/,
        getText: () => 'Boring.'
    },
    {
        regex: /please|pl(s|z)/,
        getText: () => '(with rizz)'
    },
    {
        regex: /life/,
        getText: () => `${getLifeAdjective()}.`
    },
    {
        regex: /guess (yo)?u could say/,
        getText: () => `Life is ${getLifeAdjective()}.`
    },
    {
        regex: /sons/,
        getText: () => `of ${getSonsOf()}.`
    },
    {
        regex: /dark/,
        getText: () => 'and Darker.'
    },
    {
        regex: /\bdnd\b/,
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
        regex: /that'?s crazy/,
        getText: () => 'Haha.'
    },
    {
        regex: /voti|vault of the incarnates|vaati/,
        getText: () => 'Vidya.'
    },
    {
        regex: /since we('?re not| aren'?t) doing anything/,
        getText: () => 'I gotta go.'
    },
    {
        regex: /where.*wayne/,
        getText: () => whereIsWayne()
    },
    {
        regex: /\b(big|strong|handsome|tall|smart|rich|funny)\b/,

        getText: (command: string) => {
            const arr = ['big', 'strong', 'handsome', 'tall', 'smart', 'rich', 'funny'];
            for (let i = 0; i < arr.length; i++) {
                if (command.includes(arr[i])) {
                    arr.splice(i, 1);
                }
            }
            const str = arr.join(', ');
            return `${str.charAt(0).toUpperCase()}${str.slice(1)}.`;
        }
    },
    {
        regex: /\balam\b/,
        getText: () => getAlam()
    }
];

export default async (command: string, userId: string, username: string, guildId: string): Promise<string> => {
    let botMessage = '';
    for (const regexText of regexToText) {
        if (regexText.regex.test(command)) {
            try {
                const text = await regexText.getText(command, userId, username, guildId);
                botMessage += `${text}\n`;
            } catch(err) {
                logError(err);
            }
        }
    }
    return botMessage;
};