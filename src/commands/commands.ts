import play from './play';
import roll from './roll';
import currentDisperseStreak from './current-disperse-streak';
import disperseBreaks from './disperse-breaks';
import disperseHighscore from './disperse-highscore';
import gamersStats from './gamers-stats';
import topDisperseRate from './top-disperse-rate';
import topDisperseBreaks from './top-disperse-breaks';
import reminder from './reminder/reminder';
import timeInVoice from './time-in-voice/time-in-voice';
import audioCount from './audio-count/audio-count';
import cringePoints from './cringe-points/cringe-points';
import bet from './bet/bet';
import gamble from './gamble/gamble';
import slots from './slots/slots';
import deathRoll from './death-roll/death-roll';

const commands = {
    [play.name]: play.execute,
    [roll.name]: roll.execute,
    [currentDisperseStreak.name]: currentDisperseStreak.execute,
    [disperseBreaks.name]: disperseBreaks.execute,
    [disperseHighscore.name]: disperseHighscore.execute,
    [gamersStats.name]: gamersStats.execute,
    [topDisperseRate.name]: topDisperseRate.execute,
    [topDisperseBreaks.name]: topDisperseBreaks.execute,
    [reminder.name]: reminder.execute,
    [timeInVoice.name]: timeInVoice.execute,
    [audioCount.name]: audioCount.execute,
    [cringePoints.name]: cringePoints.execute,
    [bet.name]: bet.execute,
    [gamble.name]: gamble.execute,
    [slots.name]: slots.execute,
    [deathRoll.name]: deathRoll.execute
};

const commandBuilders = [
    play.commandBuilder,
    roll.commandBuilder,
    currentDisperseStreak.commandBuilder,
    disperseBreaks.commandBuilder,
    disperseHighscore.commandBuilder,
    gamersStats.commandBuilder,
    topDisperseRate.commandBuilder,
    topDisperseBreaks.commandBuilder,
    reminder.commandBuilder,
    timeInVoice.commandBuilder,
    audioCount.commandBuilder,
    cringePoints.commandBuilder,
    bet.commandBuilder,
    gamble.commandBuilder,
    slots.commandBuilder,
    deathRoll.commandBuilder
];

export { commands, commandBuilders };