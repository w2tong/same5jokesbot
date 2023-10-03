import { getRandomRange } from '../util/util';
import Character from './Character';
import Fighter from './Classes/Fighter';
import Rogue from './Classes/Rogue';
import Wizard from './Classes/Wizard';
import { Equipment, defaultEquipment } from './Equipment/Equipment';
import { weapons } from './Equipment/Weapons';
import { CharacterStatTemplate, NPCStats } from './statTemplates';

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
        {class: Fighter, stats: NPCStats.Fighter, equipment: defaultEquipment.Fighter, name: NPCStats.Fighter.className}
    ], level, count);
}
function rogueEncounter({level, count}: EncounterParams) {
    return createCharsFunc([
        {class: Rogue, stats: NPCStats.Rogue, equipment: defaultEquipment.Rogue, name: NPCStats.Rogue.className}
    ], level, count);
}
function wizardEncounter({level, count}: EncounterParams) {
    return createCharsFunc([
        {class: Wizard, stats: NPCStats.Wizard, equipment: defaultEquipment.Wizard, name: NPCStats.Wizard.className}
    ], level, count);
}
function ratEncounter({level, count}: EncounterParams) {
    return createCharsFunc([
        {class: Character, stats: NPCStats.Rat, equipment: {mainHand: weapons.poisonbite0}, name: NPCStats.Rat.className}
    ], level, count);
}
function goblinEncounter({level, count}: EncounterParams) {
    return createCharsFunc([
        {class: Fighter, stats: NPCStats.GoblinFighter, equipment: defaultEquipment.Fighter, name: NPCStats.GoblinFighter.className},
        {class: Rogue, stats: NPCStats.GoblinRogue, equipment: defaultEquipment.Rogue, name: NPCStats.GoblinRogue.className}
    ], level, count);
}
function orcEncounter({level, count}: EncounterParams) {
    return createCharsFunc([
        {class: Fighter, stats: NPCStats.OrcFighter, equipment: defaultEquipment.Fighter, name: NPCStats.OrcFighter.className},
    ], level, count);
}

const encounters: {[key: number]: Array<() => Character[]>} = {
    1: [
        fighterEncounter({level: 1, count: 1}),
        rogueEncounter({level: 1, count: 1}),
        wizardEncounter({level: 1, count: 1}),
        ratEncounter({level: 1, count: 3}),
        orcEncounter({level: 1, count: 1}),
    ],
    2: [
        fighterEncounter({level: 2, count: 1}),
        rogueEncounter({level: 2, count: 1}),
        wizardEncounter({level: 2, count: 1}),
        ratEncounter({level: 2, count: 3}),
        goblinEncounter({level: 1, count: 1}),
        orcEncounter({level: 2, count: 1}),
    ],
    3: [
        fighterEncounter({level: 3, count: 1}),
        rogueEncounter({level: 3, count: 1}),
        wizardEncounter({level: 3, count: 1}),
        ratEncounter({level: 3, count: 3}),
        goblinEncounter({level: 2, count: 1}),
        orcEncounter({level: 3, count: 1}),
    ],
    4: [
        fighterEncounter({level: 4, count: 1}),
        rogueEncounter({level: 4, count: 1}),
        wizardEncounter({level: 4, count: 1}),
        ratEncounter({level: 4, count: 4}),
        goblinEncounter({level: 3, count: 1}),
        orcEncounter({level: 4, count: 1}),
    ],
    5: [
        fighterEncounter({level: 5, count: 1}),
        rogueEncounter({level: 5, count: 1}),
        wizardEncounter({level: 5, count: 1}),
        ratEncounter({level: 5, count: 4}),
        goblinEncounter({level: 4, count: 1}),
        orcEncounter({level: 5, count: 1}),
    ],
};

function getRandomEncounter(level: number): Character[] {
    const arr = encounters[level];
    return arr[getRandomRange(arr.length)]();
}

export { getRandomEncounter };