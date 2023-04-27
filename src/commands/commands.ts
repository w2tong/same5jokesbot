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
import audioCountBarChart from './audio-count-bar-chart';

const commands = [
    {execute: play.execute, name: play.name},
    {execute: roll.execute, name: roll.name},
    {execute: currentDisperseStreak.execute, name: currentDisperseStreak.name},
    {execute: disperseBreaks.execute, name: disperseBreaks.name},
    {execute: disperseHighscore.execute, name: disperseHighscore.name},
    {execute: gamersStats.execute, name: gamersStats.name},
    {execute: topDisperseRate.execute, name: topDisperseRate.name},
    {execute: topDisperseBreaks.execute, name: topDisperseBreaks.name},
    {execute: knitCount.execute, name: knitCount.name},
    {execute: sneezeCount.execute, name: sneezeCount.name},
    {execute: remind.execute, name: remind.name},
    {execute: deleteReminder.execute, name: deleteReminder.name},
    {execute: timeInVoice.execute, name: timeInVoice.name},
    {execute: timeInVoiceLineGraph.execute, name: timeInVoiceLineGraph.name},
    {execute: audioCountBarChart.execute, name: audioCountBarChart.name}
];

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
    audioCountBarChart.commandBuilder
];

export { commands, commandBuilders };