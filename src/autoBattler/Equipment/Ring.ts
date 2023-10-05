import { bold } from 'discord.js';
import { Item, ItemType } from './Item';

interface Ring extends Item {
    itemType: ItemType.Ring
    // Attack
    attackBonus?: number;
    damageBonus?: number;
    critRangeBonus?: number;
    critMultBonus?: number;
    // Defense
    armourClass?: number
    physDR?: number;
    magicDR?: number;
    physResist?: number;
    magicResist?: number;
    thorns?: number;
    // Mana
    manaPerAtk?: number;
    manaRegen?: number;
    manaCostReduction?: number;
    // Other
    initiativeBonus?: number;
}

type RingId = 
'abRing0' | 'abRing1' | 'abRing2'
| 'dbRing0' | 'dbRing1' | 'dbRing2'
| 'crRing'
| 'cmRing0' | 'cmRing1' | 'cmRing2' 
;

// TODO: add rings and add rings to loot table
const rings: {[id in RingId]: Ring} = {
    abRing0: {
        id: 'abRing0',
        itemType: ItemType.Ring,
        name: 'Ring of Lesser Attack',
        attackBonus: 1
    },
    abRing1: {
        id: 'abRing1',
        itemType: ItemType.Ring,
        name: 'Ring of Attack',
        attackBonus: 2
    },
    abRing2: {
        id: 'abRing2',
        itemType: ItemType.Ring,
        name: 'Ring of Greater Attack',
        attackBonus: 3
    },
    dbRing0: {
        id: 'dbRing0',
        itemType: ItemType.Ring,
        name: 'Ring of Lesser Damage',
        attackBonus: 1
    },
    dbRing1: {
        id: 'dbRing1',
        itemType: ItemType.Ring,
        name: 'Ring of Damage',
        attackBonus: 2
    },
    dbRing2: {
        id: 'dbRing2',
        itemType: ItemType.Ring,
        name: 'Ring of Greater Damage',
        attackBonus: 3
    },
    crRing: {
        id: 'crRing',
        itemType: ItemType.Ring,
        name: 'PH: CRIT RANGE RING',
        critRangeBonus: 1
    },
    cmRing0: {
        id: 'cmRing0',
        itemType: ItemType.Ring,
        name: 'PH: LESSER CRIT MULT RING',
        critMultBonus: 0.2
    },
    cmRing1: {
        id: 'cmRing1',
        itemType: ItemType.Ring,
        name: 'PH: CRIT MULT RING',
        critMultBonus: 0.35
    },
    cmRing2: {
        id: 'cmRing2',
        itemType: ItemType.Ring,
        name: 'PH: GREATER CRIT MULT RING',
        critMultBonus: 0.5
    },
};

function getRingTooltip(ring: Ring) {
    const tooltip = [];
    if (ring.attackBonus) tooltip.push(`${bold('Attack Bonus')}: ${ring.attackBonus}`);
    if (ring.damageBonus) tooltip.push(`${bold('Damage Bonus')}: ${ring.damageBonus}`);
    if (ring.critRangeBonus) tooltip.push(`${bold('Crit Range Bonus')}: ${ring.critRangeBonus}`);
    if (ring.critMultBonus) tooltip.push(`${bold('Crit Mult Bonus')}: ${ring.critMultBonus*100}%`);

    if (ring.armourClass) tooltip.push(`${bold('Armour Class')}: ${ring.armourClass}`);
    if (ring.physDR) tooltip.push(`${bold('Physical DR')}: ${ring.physDR}`);
    if (ring.magicDR) tooltip.push(`${bold('Magic DR')}: ${ring.magicDR}`);
    if (ring.physResist) tooltip.push(`${bold('Phyisical Resist')}: ${ring.physResist}`);
    if (ring.magicResist) tooltip.push(`${bold('Magic Resist')}: ${ring.magicResist}`);
    if (ring.thorns) tooltip.push(`${bold('Thorns')}: ${ring.thorns}`);

    if (ring.manaPerAtk) tooltip.push(`${bold('Mana/Attack')}: ${ring.manaPerAtk}`);
    if (ring.manaRegen) tooltip.push(`${bold('Mana Regen')}: ${ring.manaRegen}`);
    if (ring.manaCostReduction) tooltip.push(`${bold('Mana Cost Reduction')}: ${ring.manaCostReduction}`);

    if (ring.initiativeBonus) tooltip.push(`${bold('Initiative Bonus')}: ${ring.initiativeBonus}`);
    return tooltip.join('\n');
}

function getRingDescription(ring: Ring) {
    const descriptions = [];
    if (ring.attackBonus) descriptions.push(`ATK: ${ring.attackBonus}`);
    if (ring.damageBonus) descriptions.push(`DMG: ${ring.damageBonus}`);
    if (ring.critRangeBonus) descriptions.push(`Crit Range: ${ring.critRangeBonus}`);
    if (ring.critMultBonus) descriptions.push(`Crit Mult: ${ring.critMultBonus*100}%`);

    if (ring.armourClass) descriptions.push(`AC: ${ring.armourClass}`);
    if (ring.physDR) descriptions.push(`Phys DR: ${ring.physDR}`);
    if (ring.magicDR) descriptions.push(`Mag DR: ${ring.physDR}`);
    if (ring.physResist) descriptions.push(`Phys Res: ${ring.physDR}`);
    if (ring.magicResist) descriptions.push(`Mag Res: ${ring.physDR}`);
    if (ring.thorns) descriptions.push(`Thorns: ${ring.thorns}`);

    if (ring.manaPerAtk) descriptions.push(`MP/ATK: ${ring.manaPerAtk}`);
    if (ring.manaRegen) descriptions.push(`MP Regen: ${ring.manaRegen}`);
    if (ring.manaCostReduction) descriptions.push(`MCR: ${ring.manaCostReduction}`);

    if (ring.initiativeBonus) descriptions.push(`IB: ${ring.initiativeBonus}`);
    return descriptions.join(', ');
}

export { Ring, RingId, rings, getRingTooltip, getRingDescription };