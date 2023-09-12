import { getRandomRange } from '../util/util';
import Character from './Character';

function rollDice(dies: number, sides: number): number {
    let sum = 0;
    for (let i = 0; i < dies; i++) {
        sum += getRandomRange({min: 1, max: sides});
    }
    return sum;
}

function mapCharNameHealth(char: Character) {
    return `${char.getFullName()} ${char.getHealthString()}`;
}

export { rollDice, mapCharNameHealth };