// Random integer between 0 and max
function getRandomRange(max: number): number {
    return Math.floor(Math.random() * max);
}

const congratulations = ['congratulations01', 'congratulations02', 'congratulations03', 'congratulations04', 'congratulations05', 'congratulations06', 'congratulations07', 'congratulations08', 'congratulations09', 'congratulations10', 'congratulations11', 'congratulations12', 'congratulations13',]
function getCongratulations(): string {
    return congratulations[getRandomRange(congratulations.length)];
}

const regexToAudio = [
    {
        regex: /w(oah|hoa)/,
        getAudio: () => 'basementgang'
    },
    {
        regex: /(thunder vs lightning)/,
        getAudio: () => 'thunder_vs_lightning_full'
    },
    {
        regex: /demon/,
        getAudio: () => 'demontime'
    },
    {
        regex: /i'?m.*(4|four|poor|bored)/,
        getAudio: () => 'VillagerCWhat3'
    },
    {
        regex: /((yo)?u) (no|know)|sigh|yuno/,
        getAudio: () => 'sykkuno'
    },
    {
        regex: /uh.*oh/,
        getAudio: () => 'uhohstinky'
    },
    {
        regex: /(tbc.*hype|focus.*up)/,
        getAudio: () => 'tbchype'
    },
    {
        regex: /suc(c|k|tion)/,
        getAudio: () => 'suction'
    },
    {
        regex: /stop/,
        getAudio: () => 'itstimetostop'
    },
    {
        regex: /dog/,
        getAudio: () => 'whatthedogdoin'
    },
    {
        regex: /bean|badlands|chugs|eric booker/,
        getAudio: () => 'beans'
    },
    {
        regex: /smosh|shut.*up/,
        getAudio: () => 'smosh_shut_up'
    },
    {
        regex: /^\bno\b$|noidontthinkso/,
        getAudio: () => 'NOIDONTTHINKSO'
    },
    {
        regex: /fulcrum|c(o|u)me?/,
        getAudio: () => 'fulcrum_come_in'
    },
    {
        regex: /\bl\b/,
        getAudio: () => 'obliterated'
    },
    {
        regex: /good morning|morning|gm|donda/,
        getAudio: () => 'good_morning_donda'
    },
    {
        regex: /(not|doesn\'t) look.*good|watch this/,
        getAudio: () => 'guga'
    },
    {
        regex: /wake.*up/,
        getAudio: () => 'WAKEUP'
    },
    {
        regex: /want/,
        getAudio: () => 'YOUWANTEDTO'
    },
    {
        regex: /forget|forgot|forgor|i'?m walking here/,
        getAudio: () => 'fugetaboutit'
    },
    {
        regex: /blind|deaf/,
        getAudio: () => 'im_blind_not_deaf'
    },
    {
        regex: /they came|behind/,
        getAudio: () => 'they_came_from_behind'
    },
    {
        regex: /no\s*no\s*no|not like that/,
        getAudio: () => 'no_no_no_not_like_that'
    },
    {
        regex: /soda/,
        getAudio: () => 'SODA'
    },
    {
        regex: /legend(ary)?/,
        getAudio: () => 'GOLDEN_LEGENDARY'
    },
    {
        regex: /grats|congratulations|gz/,
        getAudio: () => getCongratulations()
    },
    {
        regex: /[0-9]+\s+(pc|piece|set)/,
        getAudio: () => 'the_one_piece_is_real'
    }
];

export default regexToAudio;
