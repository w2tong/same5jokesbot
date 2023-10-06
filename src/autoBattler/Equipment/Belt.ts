import { bold } from 'discord.js';
import { Item, ItemType } from './Item';

interface Belt extends Item {
    itemType: ItemType.Belt;
    charges?: number;
    effectiveness?: number;
    healing?: number;
}

// TODO: add belts
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
    if (belt.charges) tooltip.push(`${bold('Potion Charges')}: +${belt.charges}`);
    if (belt.effectiveness) tooltip.push(`${bold('Potion Effectiveness')}: +${belt.effectiveness*100}%`);
    if (belt.healing) tooltip.push(`${bold('Potion Healing')}: +${belt.healing}`);
    return tooltip.join('\n');
}

function getBeltDescription(belt: Belt) {
    const descriptions = [];
    if (belt.charges) descriptions.push(`${'Pot Charges'}: +${belt.charges}%`);
    if (belt.effectiveness) descriptions.push(`${'Pot Eff'}: +${belt.effectiveness*100}%`);
    if (belt.healing) descriptions.push(`${'Pot Heal:'}: +${belt.healing}`);
    return descriptions.join(', ');
}

export { Belt, BeltId, belts, getBeltTooltip, getBeltDescription };