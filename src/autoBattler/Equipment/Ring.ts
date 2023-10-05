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
'ph'
;

const rings: {[id in RingId]: Ring} = {
    ph: {
        id: 'ph',
        itemType: ItemType.Ring,
        name: 'PH',
    }
};

function getRingTooltip(ring: Ring) {
    const tooltip = [];
    if (ring.attackBonus) tooltip.push(`${bold('Attack Bonus')}: ${ring.attackBonus}`);
    if (ring.damageBonus) tooltip.push(`${bold('Damage Bonus')}: ${ring.damageBonus}`);
    if (ring.critRangeBonus) tooltip.push(`${bold('Crit Range Bonus')}: ${ring.critRangeBonus}`);
    if (ring.critMultBonus) tooltip.push(`${bold('Crit Mult Bonus')}: ${ring.critMultBonus}`);

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
    if (ring.critMultBonus) descriptions.push(`Crit Mult: ${ring.critMultBonus}`);

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