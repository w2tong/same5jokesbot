import play from './play';
import roll from './roll';
import currentDisperseStreak from './current-disperse-streak';
import disperseBreaks from './disperse-breaks';
import disperseHighscore from './disperse-highscore';
import gamersStats from './gamers-stats';
import topDisperseRate from './top-disperse-rate';
import topDisperseBreaks from './top-disperse-breaks';
import knitCount from './knit-count';
import sneezeCount from './sneeze-count';
import remind from './remind';
import deleteReminder from './delete-reminder';
import timeInVoice from './time-in-voice';
import timeInVoiceLineGraph from './time-in-voice-line-graph';
import audioCount from './audio-count';
import audioCountTotal from './audio-count-total';
import topTimeInVoice from './top-time-in-voice';
import timeInVoiceTogether from './time-in-voice-together';
import cringePoints from './cringe-points/cringe-points';
import bet from './bet/bet';

const commands = {
    [play.name]: play.execute,
    [roll.name]: roll.execute,
    [currentDisperseStreak.name]: currentDisperseStreak.execute,
    [disperseBreaks.name]: disperseBreaks.execute,
    [disperseHighscore.name]: disperseHighscore.execute,
    [gamersStats.name]: gamersStats.execute,
    [topDisperseRate.name]: topDisperseRate.execute,
    [topDisperseBreaks.name]: topDisperseBreaks.execute,
    [knitCount.name]: knitCount.execute,
    [sneezeCount.name]: sneezeCount.execute,
    [remind.name]: remind.execute,
    [deleteReminder.name]: deleteReminder.execute,
    [timeInVoice.name]: timeInVoice.execute,
    [timeInVoiceLineGraph.name]: timeInVoiceLineGraph.execute,
    [audioCount.name]: audioCount.execute,
    [audioCountTotal.name]: audioCountTotal.execute,
    [topTimeInVoice.name]: topTimeInVoice.execute,
    [timeInVoiceTogether.name]: timeInVoiceTogether.execute,
    [cringePoints.name]: cringePoints.execute,
    [bet.name]: bet.execute
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
    knitCount.commandBuilder,
    sneezeCount.commandBuilder,
    remind.commandBuilder,
    deleteReminder.commandBuilder,
    timeInVoice.commandBuilder,
    timeInVoiceLineGraph.commandBuilder,
    audioCount.commandBuilder,
    audioCountTotal.commandBuilder,
    topTimeInVoice.commandBuilder,
    timeInVoiceTogether.commandBuilder,
    cringePoints.commandBuilder,
    bet.commandBuilder
];

export { commands, commandBuilders };