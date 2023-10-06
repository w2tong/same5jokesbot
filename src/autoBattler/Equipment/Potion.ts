import { bold } from 'discord.js';
import { Item, ItemType } from './Item';
import { Dice } from '../dice';
import Character from '../Character';

interface Potion extends Item {
    itemType: ItemType.Potion;
    dice: Dice;
    bonus: number;
    charges: number;
    onUse?: {
        func: (self: Character) => void;
        description: string;
    }
}

type PotionId = 
'healingPotion0' | 'healingPotion1' | 'healingPotion2' | 'healingPotion3' | 'healingPotion4'
;

const potions: {[id in PotionId]: Potion} = {
    healingPotion0: {
        id: 'healingPotion0',
        itemType: ItemType.Potion,
        name: 'Lesser Healing Potion',
        dice: {num: 2, sides: 4},
        bonus: 2,
        charges: 1
    },
    healingPotion1: {
        id: 'healingPotion1',
        itemType: ItemType.Potion,
        name: 'Healing Potion',
        dice: {num: 4, sides: 4},
        bonus: 4,
        charges: 1
    },
    healingPotion2: {
        id: 'healingPotion2',
        itemType: ItemType.Potion,
        name: 'Greater Healing Potion',
        dice: {num: 6, sides: 4},
        bonus: 6,
        charges: 1
    },
    healingPotion3: {
        id: 'healingPotion3',
        itemType: ItemType.Potion,
        name: 'Superior Healing Potion',
        dice: {num: 8, sides: 4},
        bonus: 10,
        charges: 1
    },
    healingPotion4: {
        id: 'healingPotion4',
        itemType: ItemType.Potion,
        name: 'Supreme Healing Potion',
        dice: {num: 10, sides: 4},
        bonus: 20,
        charges: 1
    }
} as const;

function getPotionTooltip(potion: Potion) {
    const tooltip = [
        `${bold('Healing')}: ${potion.dice.num * potion.dice.sides + potion.bonus}`,
        `${bold('Charges')}: ${potion.charges}`
    ];
    if (potion.onUse) tooltip.push(`${bold('On Use:')}: ${potion.onUse.description}`);
    return tooltip.join('\n');
}

function getPotionDescription(potion: Potion) {
    const descriptions = [
        `${'Healing'}: ${potion.dice.num * potion.dice.sides + potion.bonus}`,
        `${'Charges'}: ${potion.charges}`
    ];
    if (potion.onUse) descriptions.push(`${'On Use:'}: ${potion.onUse.description}`);
    return descriptions.join(', ');
}

export { Potion, PotionId, potions, getPotionTooltip, getPotionDescription };