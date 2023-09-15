import Fighter from './Fighter';
import Rogue from './Rogue';
import Wizard from './Wizard';

const classes = {
    Fighter: Fighter,
    Rogue: Rogue,
    Wizard: Wizard
} as const;

type ClassName = keyof typeof classes;

export { classes, ClassName };