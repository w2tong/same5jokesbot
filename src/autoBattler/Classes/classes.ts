import Fighter from './Fighter';
import Rogue from './Rogue';
import Wizard from './Wizard';

const Classes = {
    Fighter: Fighter,
    Rogue: Rogue,
    Wizard: Wizard
} as const;

type ClassName = keyof typeof Classes;

export { Classes, ClassName };