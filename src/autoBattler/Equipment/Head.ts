import { bold } from 'discord.js';
import { Item, ItemType } from './Item';

interface Head extends Item {
    itemType: ItemType.Head
    armourClass?: number
    manaPerAtk?: number;
    manaRegen?: number;
    manaCostReduction?: number;
    initiativeBonus?: number;
}

type HeadId = 
'platehelmet0' | 'platehelmet1' | 'platehelmet2' |
'clothhood0' | 'clothhood1' | 'clothhood2' 
;

const heads: {[id in HeadId]: Head} = {
    platehelmet0: {
        id: 'platehelmet0',
        itemType: ItemType.Head,
        name: 'Plate Helmet',
        armourClass: 1
    },
    platehelmet1: {
        id: 'platehelmet1',
        itemType: ItemType.Head,
        name: 'Plate Helmet +1',
        armourClass: 2
    },
    platehelmet2: {
        id: 'platehelmet2',
        itemType: ItemType.Head,
        name: 'Plate Helmet +2',
        armourClass: 3
    },
    clothhood0: {
        id: 'clothhood0',
        itemType: ItemType.Head,
        name: 'Cloth Hood',
        manaCostReduction: 10
    },
    clothhood1: {
        id: 'clothhood1',
        itemType: ItemType.Head,
        name: 'Cloth Hood +1',
        manaCostReduction: 15
    },
    clothhood2: {
        id: 'clothhood2',
        itemType: ItemType.Head,
        name: 'Cloth Hood +2',
        manaCostReduction: 20
    }
} as const;

function getHeadTooltip(head: Head) {
    const tooltip = [];
    if (head.armourClass) tooltip.push(`${bold('Armour Class')}: ${head.armourClass}`);
    if (head.manaPerAtk) tooltip.push(`${bold('Mana/Attack')}: ${head.manaPerAtk}`);
    if (head.manaRegen) tooltip.push(`${bold('Mana Regen')}: ${head.manaRegen}`);
    if (head.manaCostReduction) tooltip.push(`${bold('Mana Cost Reduction')}: ${head.manaCostReduction}`);
    if (head.initiativeBonus) tooltip.push(`${bold('Initiative Bonus')}: ${head.initiativeBonus}`);
    return tooltip.join('\n');
}

function getHeadDescription(head: Head) {
    const descriptions = [];
    if (head.armourClass) descriptions.push(`AC: ${head.armourClass}`);
    if (head.manaPerAtk) descriptions.push(`MP/ATK: ${head.manaPerAtk}`);
    if (head.manaRegen) descriptions.push(`MP Regen: ${head.manaRegen}`);
    if (head.manaCostReduction) descriptions.push(`MCR: ${head.manaCostReduction}`);
    if (head.initiativeBonus) descriptions.push(`IB: ${head.initiativeBonus}`);
    return descriptions.join(', ');
}

export { Head, HeadId, heads, getHeadTooltip, getHeadDescription };