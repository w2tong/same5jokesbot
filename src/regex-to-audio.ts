import moment from "moment-timezone";
import { getRandomRange } from './util'

const congratulations = ['congratulations01', 'congratulations02', 'congratulations03', 'congratulations04', 'congratulations05', 'congratulations06', 'congratulations07', 'congratulations08', 'congratulations09', 'congratulations10', 'congratulations11', 'congratulations12', 'congratulations13']
function getCongratulations(): string {
    return congratulations[getRandomRange(congratulations.length)];
}

const shutUp = ['smosh_shut_up', 'imaqtpie_shut_up']
function getShutUp(): string {
    return shutUp[getRandomRange(shutUp.length)];
}

const letsGo = ['ryze_lets_go_lets_go', 'dababy_lets_go'];
function getLetsGo(): string {
    return letsGo[getRandomRange(letsGo.length)];
}

const regexToAudio = [
    {
        regex: /w(oah|hoa)/,
        getAudio: () => 'basementgang'
    },
    {
        regex: /(thunder v(ersu)?s lightning)/,
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
        regex: /smosh|shut.*up|imaqtpie/,
        getAudio: () => getShutUp()
    },
    {
        regex: /i don'?t think so/,
        getAudio: () => 'NOIDONTTHINKSO'
    },
    {
        regex: /fulcrum|come in/,
        getAudio: () => 'fulcrum_come_in'
    },
    {
        regex: /obliterated|need i say more/,
        getAudio: () => 'obliterated'
    },
    {
        regex: /good morning,? donda/,
        getAudio: () => 'good_morning_donda'
    },
    {
        regex: /good morning|morning|\bgm\b|donda/,
        getAudio: () => 'good_morning_donda_short'
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
        regex: /wanted to/,
        getAudio: () => 'YOUWANTEDTO'
    },
    {
        regex: /forget|forgot|forgor|(i'?m|i am) walking here/,
        getAudio: () => 'fugetaboutit'
    },
    {
        regex: /blind|deaf|can'?t see/,
        getAudio: () => 'im_blind_not_deaf'
    },
    {
        regex: /they came|behind/,
        getAudio: () => 'they_came_from_behind'
    },
    {
        regex: /no,?\s*no,?\s*no|not like that/,
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
        regex: /grats|congratulations|\bgz\b/,
        getAudio: () => getCongratulations()
    },
    {
        regex: /([0-9]+|one|two|three|four|five|six|seven|eight|nine|for)\s*(pc|piece|set|peace)/,
        getAudio: () => 'the_one_piece_is_real'
    },
    {
        regex: /hbd|b(irth)?day/,
        getAudio: () => 'michael_its_your_bd_today'
    },
    {
        regex: /ahem|cough|breakfast/,
        getAudio: () => 'breakfast'
    },
    {
        regex: /food/,
        getAudio: () => {
            const hour = moment().utc().tz('America/Toronto').hour();
            if (hour >= 4 && hour < 12) {
                return 'breakfast'
            }
            return ''
        }
    },
    {
        regex: /infinite|possib|\baxe\b/,
        getAudio: () => 'infinite_possibilities'
    },
    {
        regex: /small.*cat|feral|meow/,
        getAudio: () => 'small_cat'
    },
    {
        regex: /under.*water/,
        getAudio: () => 'i_am_under_the_water'
    },
    {
        regex: /everybody/,
        getAudio: () => 'guga_everybody'
    },
    {
        regex: /arthur|knit/,
        getAudio: () => 'arthur_knitter'
    },
    {
        regex: /zoomin|foreign|\bt(yler)?\s?(1|one)/,
        getAudio: () => 'zoomin_in_the_foreign'
    },
    {
        regex: /bye|baj|badge/,
        getAudio: () => 'baj_baj'
    },
    {
        regex: /mask/,
        getAudio: () => 'bane_mask'
    },
    {
        regex: /(for|4)\s+(yo)?u/,
        getAudio: () => 'bane_for_you'
    },
    {
        regex: /get ready/,
        getAudio: () => 'get_ready_MOAB'
    },
    {
        regex: /disgusting/,
        getAudio: () => 'disgustang'
    },
    {
        regex: /all the|alda/,
        getAudio: () => 'small_things'
    },
    {
        regex: /uh guys/,
        getAudio: () => 'uh_guys'
    },
    {
        regex: /teleporting fat guy/,
        getAudio: () => 'teleporting_fat_guy'
    },
    {
        regex: /teleport|fat guy/,
        getAudio: () => 'teleporting_fat_guy_short'
    },
    {
        regex: /developers/,
        getAudio: () => 'steve_ballmer_developers'
    },
    {
        regex: /valor/,
        getAudio: () => 'quinn_what_do_you_see_up_there'
    },
    {
        regex: /let'?s go/,
        getAudio: () => getLetsGo()
    },
    {
        regex: /obamn?a/,
        getAudio: () => 'obamna'
    },
    {
        regex: /((ya|yeah),?\s*){3}/,
        getAudio: () => 'i_am_lorde'
    },
    {
        regex: /oh?,?\s*((g|j)eez|cheese)/,
        getAudio: () => 'oh_geez'
    },
    {
        regex: /wrap|finger/,
        getAudio: () => 'wrapped_around_your_finger'
    },
    {
        regex: /manwa|manua|manhua|manga|anime|v.*tuber|get a life|gura|amelia watson|iron mouse/,
        getAudio: () => 'dr_disrespect_get_a_life'
    },
    {
        regex: /game over/,
        getAudio: () => 'game_over_man'
    },
    {
        regex: /giga/,
        getAudio: () => 'gigachad'
    },
    {
        regex: /jinx/,
        getAudio: () => 'jinx'
    },
    {
        regex: /library|be (quiet|silent)/,
        getAudio: () => 'this_is_library'
    },
    {
        regex: /hiding/,
        getAudio: () => 'twitch_i_was_hiding'
    },
    {
        regex: /short/,
        getAudio: () => 'veigar_short_joke'
    },
    {
        regex: /silence/,
        getAudio: () => 'dota2_silence'
    },
    {
        regex: /let him cook/,
        getAudio: () => 'let_him_cook'
    }
];

export default regexToAudio;