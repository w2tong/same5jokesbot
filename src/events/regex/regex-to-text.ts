import { emotes } from '../../emotes';
import { getDisperseCurrentStreak, updateDisperseCurrentStreak, updateDisperseStreakBreaks, updateDisperseStreakHighScore, updateGamersCounter } from '../../sql/oracledb';
import { getRandomRange } from '../../util';

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
        getText: async (userId: string, _message: string, username: string, guildId: string) => {
            let res = getGamersResponse();
            updateGamersCounter(userId, res);
            const disperseCurrentStreak = await getDisperseCurrentStreak(guildId);
            if (res === 'Disperse!') {
                let userIds = `${disperseCurrentStreak.USER_IDS}`;
                if (disperseCurrentStreak.STREAK > 0) {
                    userIds += `,${userId}`;
                }
                updateDisperseCurrentStreak(guildId, userIds, disperseCurrentStreak.STREAK+1);
                updateDisperseStreakHighScore(guildId, userIds, disperseCurrentStreak.STREAK+1);
            }
            else {
                if (disperseCurrentStreak.STREAK > 1) {
                    res = `${res}\nDisperse Streak: **${disperseCurrentStreak.STREAK}** broken by **${username}**`;
                    updateDisperseStreakBreaks(userId, disperseCurrentStreak.STREAK);
                }
                updateDisperseCurrentStreak(guildId, userId, 0);
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
    // Images
    {
        regex: /166/,
        getText: () => 'https://media.discordapp.net/attachments/158049091434184705/795546735594045450/unknown.png'
    },
    {
        regex: /judge?ment/,
        getText: () => 'https://media.discordapp.net/attachments/837434910486691873/1008836841581072454/judgment.png'
    },
    {
        regex: /\bmc\b|minecraft|chernobyl/,
        getText: () => 'https://cdn.discordapp.com/attachments/982195734046732338/1078118698222628915/mc_chernobyl.png'
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

        getText: (_userId: string, message: string) => {
            const arr = ['big', 'strong', 'handsome', 'tall', 'smart', 'rich', 'funny'];
            for (let i = 0; i < arr.length; i++) {
                if (message.includes(arr[i])) {
                    arr.splice(i, 1);
                }
            }
            const str = arr.join(', ');
            return `${str.charAt(0).toUpperCase()}${str.slice(1)}.`;
        }
    }
];

export default regexToText;
