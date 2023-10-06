import { bold } from 'discord.js';
import { Item, ItemType } from './Item';

interface Belt extends Item {
    itemType: ItemType.Belt;
    charges?: number;
    effectiveness?: number;
    healing?: number;
}

type BeltId = 
'belt'
;

const belts: {[id in BeltId]: Belt} = {
    'belt': {
        id: 'belt',
        itemType: ItemType.Belt,
        name: 'Belt',
    }
} as const;

function getBeltTooltip(belt: Belt) {
    const tooltip = [];
    if (belt.charges) tooltip.push(`${bold('Potion Effectiveness')}: +${belt.effectiveness}%`);
    if (belt.effectiveness) tooltip.push(`${bold('Potion Healing')}: +${belt.healing}`);
    if (belt.healing) tooltip.push(`${bold('Potion Charges:')}: +${belt.charges}`);
    return tooltip.join('\n');
}

function getBeltDescription(belt: Belt) {
    const descriptions = [];
    if (belt.charges) descriptions.push(`${'Pot Eff'}: +${belt.effectiveness}%`);
    if (belt.effectiveness) descriptions.push(`${'Pot Heal'}: +${belt.healing}`);
    if (belt.healing) descriptions.push(`${'Pot Charges:'}: +${belt.charges}`);
    return descriptions.join(', ');
}

export { Belt, BeltId, belts, getBeltTooltip, getBeltDescription };