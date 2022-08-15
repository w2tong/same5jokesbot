import { emotes } from './emotes'

// Random integer between 0 and max
function getRandomRange(max: number): number {
    return Math.floor(Math.random() * max);
}

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
        regex: /gamers/,
        getText: () => getGamersResponse()
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
        regex: /no shot/,
        getText: () => 'Shot.'
    },
    {
        regex: /^(no)shot/,
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
        getText: () => `I'm a leak, I'm a leak. ${emotes.sadge ?? ''}`
    },
    {
        regex: /166/,
        getText: () => 'https://media.discordapp.net/attachments/158049091434184705/795546735594045450/unknown.png'
    },
    {
        regex: /judge?ment/,
        getText: () => 'https://media.discordapp.net/attachments/837434910486691873/1008836841581072454/judgment.png'
    },
];

export default regexToText;