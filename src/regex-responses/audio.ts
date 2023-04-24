import moment from 'moment-timezone';
import { updateKnitCount } from '../sql/knit-count';
import { updateSneezeCount } from '../sql/sneeze-count';
import { getRandomRange } from '../util';

const congratulations = ['congratulations01', 'congratulations02', 'congratulations03', 'congratulations04', 'congratulations05', 'congratulations06', 'congratulations07', 'congratulations08', 'congratulations09', 'congratulations10', 'congratulations11', 'congratulations12', 'congratulations13'];
function getCongratulations(): string {
    return congratulations[getRandomRange(congratulations.length)];
}

const shutUp = ['smosh_shut_up', 'imaqtpie_shut_up'];
function getShutUp(): string {
    return shutUp[getRandomRange(shutUp.length)];
}

const letsGo = ['ryze_lets_go_lets_go', 'dababy_lets_go'];
function getLetsGo(): string {
    return letsGo[getRandomRange(letsGo.length)];
}

const valor = ['quinn_to_me', 'quinn_what_do_you_see_up_there'];
function getValor(): string {
    return valor[getRandomRange(valor.length)];
}

const dog = ['whatthedogdoin', 'i_am_a_doggie'];
function getDog(): string {
    return dog[getRandomRange(dog.length)];
}

const mask = ['bane_mask', 'dream_mask'];
function getMask(): string {
    return mask[getRandomRange(mask.length)];
}

const noNoNo = ['no_no_no_not_like_that', 'jerry_no_no_no'];
function getNoNoNo(): string {
    return noNoNo[getRandomRange(noNoNo.length)];
}

const blind = ['im_blind_not_deaf', 'smelly_enemy'];
function getBlind(): string {
    return blind[getRandomRange(blind.length)];
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
        regex: /demon time/,
        getAudio: () => 'demontime'
    },
    {
        regex: /i'?m.*(4|four|poor|bored)/,
        getAudio: () => 'VillagerCWhat3'
    },
    {
        regex: /sigh|yuno/,
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
        regex: /time (to|2) stop/,
        getAudio: () => 'itstimetostop'
    },
    {
        regex: /dog/,
        getAudio: () => getDog()
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
        regex: /(not|doesn'?t) look.*good|but watch this/,
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
        regex: /forget|forgot|forgor|(i'?m|i am) walking here|don'?t you/,
        getAudio: () => 'fugetaboutit'
    },
    {
        regex: /blind|can'?t see/,
        getAudio: () => getBlind()
    },
    {
        regex: /they came|from behind/,
        getAudio: () => 'they_came_from_behind'
    },
    {
        regex: /no,?\s*no,?\s*no|not like that/,
        getAudio: () => getNoNoNo()
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
                return 'breakfast';
            }
            return '';
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
        regex: /everybody|cheers|take care|amazing|that'?s what i'?m talking about|all right/,
        getAudio: () => 'guga_everybody'
    },
    {
        regex: /arthur|knit|fuchsia/,
        getAudio: (userId: string) => {
            void updateKnitCount(userId);
            return 'arthur_knitter';
        }
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
        getAudio: () => getMask()
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
        regex: /\ball the\b|alda/,
        getAudio: () => 'small_things'
    },
    {
        regex: /small things/,
        getAudio: () => 'all_the'
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
        getAudio: () => getValor()
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
        regex: /let (him|me) cook/,
        getAudio: () => 'let_him_cook'
    },
    {
        regex: /i('?m| am) a dwarf|diggy diggy hole/,
        getAudio: () => 'diggy_diggy_hole'
    },
    {
        regex: /i gotta go|i'?m leaving|since we'?re not doing anything/,
        getAudio: () => 'discord_disconnect'
    },
    {
        regex: /father/,
        getAudio: () => 'father'
    },
    {
        regex: /oink|pig/,
        getAudio: () => 'pig'
    },
    {
        regex: /that'?s it|i'?m dead/,
        getAudio: () => 'thats_it_im_dead'
    },
    {
        regex: /why (nu|new)\s*(nu|new)/,
        getAudio: () => 'im_ripping_out_my_hair'
    },
    {
        regex: /ripping out my hair/,
        getAudio: () => 'why_nunu_why'
    },
    {
        regex: /sneez|bless you|hocus pocus/,
        getAudio: (userId :string) => {
            void updateSneezeCount(userId);
            return 'train_sneeze';
        }
    },
    {
        regex: /slow mo(de)?|slow.*(it|that|sneeze).*down/,
        //updateSneezeCount
        getAudio: (userId :string) => {
            void updateSneezeCount(userId);
            return 'train_sneeze_slow';
        }
    },
    {
        regex: /(for|four|force?)\s*(send?|sin|and|in|son|cen|ing)/,
        getAudio: () => 'boys'
    },
    {
        regex: /whopper,? whopper,? whopper,? whopper/,
        getAudio: () => 'whopper_whopper'
    },
    {
        regex: /whopper/,
        getAudio: () => 'whopper_whopper_short'
    },
    {
        regex: /hard.*core/,
        getAudio: () => 'keep_it_hardcore'
    },
    {
        regex: /to the arena/,
        getAudio: () => 'xin_zhao_to_the_arena'
    },
    {
        regex: /f(ri|u)cked/,
        getAudio: () => 'what_a_fd_up_day'
    },
    {
        regex: /i did not|it'?s not true|it'?s bullshit|hi,? mark/,
        getAudio: () => 'oh_hi_mark'
    },
    {
        regex: /where (are they|is she)/,
        getAudio: () => 'batman_where_are_they'
    },
    {
        regex: /(j|g)erry/,
        getAudio: () => 'jerry'
    },
    {
        regex: /wedg(ie|y)|wechi/,
        getAudio: () => 'wedgie'
    },
    {
        regex: /killer/,
        getAudio: () => 'killer'
    },
    {
        regex: /potion/,
        getAudio: () => 'potion_seller'
    },
    {
        regex: /dopa|don't put down/,
        getAudio: () => 'dopa_down'
    },
    {
        regex: /\ba tip\b/,
        getAudio: () => 'and_a_spear_behind_it'
    },
    {
        regex: /disconnect|\bdc\b/,
        getAudio: () => 'he_disconnected'
    },
    {
        regex: /\baudi\b/,
        getAudio: () => 'audi'
    }
];

export default (command: string, userId: string) => {
    for (const regexAudio of regexToAudio) {
        if (regexAudio.regex.test(command)) {
            return regexAudio.getAudio(userId);
        }
    }
    return '';
};