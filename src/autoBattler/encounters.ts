import { getRandomRange } from '../util/util';
import Character from './Character';
import Fighter from './Classes/Fighter';
import Rogue from './Classes/Rogue';
import Wizard from './Classes/Wizard';
import { CharacterStatTemplate, ClassStats, RatStats } from './statTemplates';

function createCharsFunc(chars: {class: typeof Character, stats: CharacterStatTemplate, name: string}[], level: number, count: number) {
    return () => {
        const charsArr: Character[] = [];
        if (count === 1) {
            for (const char of chars) {
                charsArr.push(new char.class(level, char.stats, `${char.name}`));
            }
        }
        else {
            for (let i = 0; i < count; i++) {
                for (const char of chars) {
                    charsArr.push(new char.class(level, char.stats, `${char.name} ${i+1}`));
                }
            }
        }
        
        return charsArr;
    };
}

type EncounterParams = {level: number, count: number}
function fighterEncounter({level, count}: EncounterParams) {
    return createCharsFunc([
        {class: Fighter, stats: ClassStats.Fighter, name: 'Fighter'}
    ], level, count);
}
function rogueEncounter({level, count}: EncounterParams) {
    return createCharsFunc([
        {class: Rogue, stats: ClassStats.Rogue, name: 'Rogue'}
    ], level, count);
}
function wizardEncounter({level, count}: EncounterParams) {
    return createCharsFunc([
        {class: Wizard, stats: ClassStats.Wizard, name: 'Wizard'}
    ], level, count);
}
function ratEncounter({level, count}: EncounterParams) {
    return createCharsFunc([
        {class: Character, stats: RatStats, name: 'Rat'}
    ], level, count);
}

const encounters: {[key: number]: Array<() => Character[]>} = {
    1: [
        fighterEncounter({level: 1, count: 1}),
        rogueEncounter({level: 1, count: 1}),
        wizardEncounter({level: 1, count: 1}),
        ratEncounter({level: 1, count: 3})
    ]
};

function getRandomEncounter(level: number): Character[] {
    const arr = encounters[level];
    return arr[getRandomRange(arr.length)]();
}

export { getRandomEncounter };