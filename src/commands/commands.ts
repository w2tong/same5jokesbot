import play from './play';
import roll from './roll';
import disperse from './disperse/disperse';
import gamersStats from './gamers-stats/gamer-stats';
import reminder from './reminder/reminder';
import timeInVoice from './time-in-voice/time-in-voice';
import audioCount from './audio-count/audio-count';
import cringePoints from './cringe-points/cringe-points';
import bet from './bet/bet';
import gamble from './gamble/gamble';
import slots from './slots/slots';
import deathRoll from './death-roll/death-roll';
import lottery from './lottery/lottery';
import request from './request/request';
import profits from './profits/profits';
import tax from './tax/tax';
import steal from './steal/steal';
import blackjack from './blackjack/blackjack';
import daily from './daily/daily';
import upgrade from './upgrade/upgrade';

const commands = {
    [play.name]: play.execute,
    [roll.name]: roll.execute,
    [disperse.name]: disperse.execute,
    [gamersStats.name]: gamersStats.execute,
    [reminder.name]: reminder.execute,
    [timeInVoice.name]: timeInVoice.execute,
    [audioCount.name]: audioCount.execute,
    [cringePoints.name]: cringePoints.execute,
    [bet.name]: bet.execute,
    [gamble.name]: gamble.execute,
    [slots.name]: slots.execute,
    [deathRoll.name]: deathRoll.execute,
    [lottery.name]: lottery.execute,
    [request.name]: request.execute,
    [profits.name]: profits.execute,
    [tax.name]: tax.execute,
    [steal.name]: steal.execute,
    [blackjack.name]: blackjack.execute,
    [daily.name]: daily.execute,
    [upgrade.name]: upgrade.execute,
};

const commandBuilders = [
    play.commandBuilder,
    roll.commandBuilder,
    disperse.commandBuilder,
    gamersStats.commandBuilder,
    reminder.commandBuilder,
    timeInVoice.commandBuilder,
    audioCount.commandBuilder,
    cringePoints.commandBuilder,
    bet.commandBuilder,
    gamble.commandBuilder,
    slots.commandBuilder,
    deathRoll.commandBuilder,
    lottery.commandBuilder,
    request.commandBuilder,
    profits.commandBuilder,
    tax.commandBuilder,
    steal.commandBuilder,
    blackjack.commandBuilder,
    daily.commandBuilder,
    upgrade.commandBuilder,
];

export { commands, commandBuilders };