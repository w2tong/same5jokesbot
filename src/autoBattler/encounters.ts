import { getRandomRange } from '../util/util';
import Battle, { Side } from './Battle';
import Character from './Character';
import Fighter from './Classes/Fighter';
import Rogue from './Classes/Rogue';
import Wizard from './Classes/Wizard';
import { ClassStats, RatStats } from './statTemplates';

function fighterEncounter(level: number) {
    return (battle: Battle) => {
        return [
            new Fighter(level, ClassStats.Fighter, 'Fighter', {ref: battle, side: Side.Right, index: 0})
        ];
    };
}
function rogueEncounter(level: number) {
    return (battle: Battle) => {
        return [
            new Rogue(level, ClassStats.Rogue, 'Rogue', {ref: battle, side: Side.Right, index: 0})
        ];
    };
}
function wizardEncounter(level: number) {
    return (battle: Battle) => {
        return [
            new Wizard(level, ClassStats.Wizard, 'Wizard', {ref: battle, side: Side.Right, index: 0})
        ];
    };
}
function ratEncounter(level: number) {
    return (battle: Battle) => {
        return [
            new Character(level, RatStats, 'Rat 1', {ref: battle, side: Side.Right, index: 0}),
            new Character(level, RatStats, 'Rat 2', {ref: battle, side: Side.Right, index: 1}),
            new Character(level, RatStats, 'Rat 3', {ref: battle, side: Side.Right, index: 2})
        ];
    };
}

// need to nest this type           -----------------------v
const encounters: {[key: number]: Array<(battle: Battle) => Character[]>} = {
    1: [
        fighterEncounter(1),
        rogueEncounter(1),
        wizardEncounter(1),
        ratEncounter(1)
    ]
};

function getRandomEncounter(battle: Battle, level: number): Character[] {
    const arr = encounters[level];
    return arr[getRandomRange(arr.length)](battle);
}

export { getRandomEncounter };