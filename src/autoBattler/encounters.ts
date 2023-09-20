import { getRandomRange } from '../util/util';
import Character from './Character';
import Fighter from './Classes/Fighter';
import Rogue from './Classes/Rogue';
import Wizard from './Classes/Wizard';
import { Equipment, defaultEquipment } from './Equipment/Equipment';
import { weapons } from './Equipment/Weapons';
import { CharacterStatTemplate, ClassStats, RatStats } from './statTemplates';

function createCharsFunc(chars: {class: typeof Character, stats: CharacterStatTemplate, equipment: Equipment, name: string}[], level: number, count: number) {
    return () => {
        const charsArr: Character[] = [];
        if (count === 1) {
            for (const char of chars) {
                charsArr.push(new char.class(level, char.stats, char.equipment, `${char.name}`));
            }
        }
        else {
            for (let i = 0; i < count; i++) {
                for (const char of chars) {
                    charsArr.push(new char.class(level, char.stats, char.equipment, `${char.name} ${i+1}`));
                }
            }
        }
        
        return charsArr;
    };
}

type EncounterParams = {level: number, count: number}
function fighterEncounter({level, count}: EncounterParams) {
    return createCharsFunc([
        {class: Fighter, stats: ClassStats.Fighter, equipment: defaultEquipment.Fighter, name: 'Fighter'}
    ], level, count);
}
function rogueEncounter({level, count}: EncounterParams) {
    return createCharsFunc([
        {class: Rogue, stats: ClassStats.Rogue, equipment: defaultEquipment.Rogue, name: 'Rogue'}
    ], level, count);
}
function wizardEncounter({level, count}: EncounterParams) {
    return createCharsFunc([
        {class: Wizard, stats: ClassStats.Wizard, equipment: defaultEquipment.Wizard, name: 'Wizard'}
    ], level, count);
}
function ratEncounter({level, count}: EncounterParams) {
    return createCharsFunc([
        {class: Character, stats: RatStats, equipment: {mainHand: weapons.una1}, name: 'Rat'}
    ], level, count);
}

const encounters: {[key: number]: Array<() => Character[]>} = {
    1: [
        fighterEncounter({level: 1, count: 1}),
        rogueEncounter({level: 1, count: 1}),
        wizardEncounter({level: 1, count: 1}),
        ratEncounter({level: 1, count: 3})
    ],
    2: [
        fighterEncounter({level: 2, count: 1}),
        rogueEncounter({level: 2, count: 1}),
        wizardEncounter({level: 2, count: 1}),
        ratEncounter({level: 2, count: 3})
    ],
    3: [
        fighterEncounter({level: 3, count: 1}),
        rogueEncounter({level: 3, count: 1}),
        wizardEncounter({level: 3, count: 1}),
        ratEncounter({level: 3, count: 3})
    ],
    4: [
        fighterEncounter({level: 4, count: 1}),
        rogueEncounter({level: 4, count: 1}),
        wizardEncounter({level: 4, count: 1}),
        ratEncounter({level: 4, count: 3})
    ],
    5: [
        fighterEncounter({level: 5, count: 1}),
        rogueEncounter({level: 5, count: 1}),
        wizardEncounter({level: 5, count: 1}),
        ratEncounter({level: 5, count: 3})
    ],
};

function getRandomEncounter(level: number): Character[] {
    const arr = encounters[level];
    return arr[getRandomRange(arr.length)]();
}

export { getRandomEncounter };