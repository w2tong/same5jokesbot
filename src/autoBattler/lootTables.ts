import { ShieldId } from './Equipment/Shield';
import { WeaponId } from './Equipment/Weapons';

type LootTable = (WeaponId|ShieldId)[];

const lootTiers: {[tier: number]: LootTable} = {
    0: ['longsword0', 'greatsword0', 'dagger0', 'quarterstaff0', 'buckler0'],
    1: ['longsword1', 'greatsword1', 'dagger1', 'quarterstaff1'],
};

const lootTables: {[level: number]: {normal: LootTable, rare: LootTable, rareChance: number}} = {
    1: {normal: lootTiers[0], rare: lootTiers[1], rareChance: 0.05},
    2: {normal: lootTiers[0], rare: lootTiers[1], rareChance: 0.1},
    3: {normal: lootTiers[0], rare: lootTiers[1], rareChance: 0.25},
    4: {normal: lootTiers[0], rare: lootTiers[1], rareChance: 0.5},
    5: {normal: lootTiers[1], rare: lootTiers[1], rareChance: 0.05},
};

export default lootTables;