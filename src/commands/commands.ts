import play from './play';
import roll from './roll';
import disperseBreaks from './disperse-breaks';
import disperseHighscore from './disperse-highscore';
import gamersStats from './gamers-stats';
import topDisperseRate from './top-disperse-rate';
import topDisperseBreaks from './top-disperse-breaks';
import knitCount from './knit-count';
import sneezeCount from './sneeze-count';

const commands = [
    {execute: play.execute, name: play.name},
    {execute: roll.execute, name: roll.name},
    {execute: disperseBreaks.execute, name: disperseBreaks.name},
    {execute: disperseHighscore.execute, name: disperseHighscore.name},
    {execute: gamersStats.execute, name: gamersStats.name},
    {execute: topDisperseRate.execute, name: topDisperseRate.name},
    {execute: topDisperseBreaks.execute, name: topDisperseBreaks.name},
    {execute: knitCount.execute, name: knitCount.name},
    {execute: sneezeCount.execute, name: sneezeCount.name}
];

const commandBuilders = [
    play.commandBuilder,
    roll.commandBuilder,
    disperseBreaks.commandBuilder,
    disperseHighscore.commandBuilder,
    gamersStats.commandBuilder,
    topDisperseRate.commandBuilder,
    topDisperseBreaks.commandBuilder,
    knitCount.commandBuilder,
    sneezeCount.commandBuilder
];

export { commands, commandBuilders };