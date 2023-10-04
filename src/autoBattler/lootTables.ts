import { ArmourId } from './Equipment/Armour';
import { HeadId } from './Equipment/Head';
import { ShieldId } from './Equipment/Shield';
import { WeaponId } from './Equipment/Weapons';

type LootTable = (WeaponId|ShieldId|HeadId|ArmourId)[];

const lootTiers: {[tier: number]: LootTable} = {
    0: [
        // Weapons
        'longsword0', 'greatsword0', 'dagger0', 'quarterstaff0', 
        // Shields
        'buckler0', 
        // Armour
        'robe0', 'lightarmour0', 'mediumarmour0', 'heavyarmour0'
    ],
    1: [
        // Weapons
        'longsword1', 'greatsword1', 'dagger1', 'quarterstaff1', 
        // Shields
        'buckler1', 
        // Armour
        'robe1', 'lightarmour1', 'mediumarmour1', 'heavyarmour1', 
        // Heads
        'platehelmet0', 'clothhood0'
    ],
    2: [
        // Weapons
        'longsword2', 'greatsword2', 'dagger2', 'quarterstaff2', 
        // Shields
        'buckler2', 
        // Armour
        'robe2', 'lightarmour2', 'mediumarmour2', 'heavyarmour2',
        // Heads
        'platehelmet0', 'clothhood0'
    ],
    3: [
        // Weapons
        'longsword3', 'greatsword3', 'dagger3', 'quarterstaff3', 
        // Shields
        'buckler3', 
        // Armour
        'robe3', 'lightarmour3', 'mediumarmour3', 'heavyarmour3',
        // Heads
        'platehelmet1', 'clothhood1'
    ],
    4: [
        // Weapons
        'longsword4', 'greatsword4', 'dagger4', 'quarterstaff4', 
        // Shields
        'buckler4', 
        // Armour
        'robe4', 'lightarmour4', 'mediumarmour4', 'heavyarmour4',
        // Heads
        'platehelmet1', 'clothhood1'
    ],
        
    5: [
        // Weapons
        'longsword5', 'greatsword5', 'dagger5', 'quarterstaff5', 
        // Shields
        'buckler5', 
        // Armour
        'robe5', 'lightarmour5', 'mediumarmour5', 'heavyarmour5',
        // Heads
        'platehelmet2', 'clothhood2'
    ],
};

const lootTables: {[level: number]: {normal: LootTable, rare: LootTable, rareChance: number}} = {
    1: {normal: lootTiers[0], rare: lootTiers[1], rareChance: 0.05},
    2: {normal: lootTiers[0], rare: lootTiers[1], rareChance: 0.1},
    3: {normal: lootTiers[0], rare: lootTiers[1], rareChance: 0.25},
    4: {normal: lootTiers[0], rare: lootTiers[1], rareChance: 0.5},
    5: {normal: lootTiers[1], rare: lootTiers[2], rareChance: 0.05},
    6: {normal: lootTiers[1], rare: lootTiers[2], rareChance: 0.1},
    7: {normal: lootTiers[1], rare: lootTiers[2], rareChance: 0.25},
    8: {normal: lootTiers[1], rare: lootTiers[2], rareChance: 0.5},
    9: {normal: lootTiers[2], rare: lootTiers[3], rareChance: 0.05},
    10: {normal: lootTiers[2], rare: lootTiers[3], rareChance: 0.1},
    11: {normal: lootTiers[2], rare: lootTiers[3], rareChance: 0.25},
    12: {normal: lootTiers[2], rare: lootTiers[3], rareChance: 0.5},
    13: {normal: lootTiers[3], rare: lootTiers[4], rareChance: 0.05},
    14: {normal: lootTiers[3], rare: lootTiers[4], rareChance: 0.1},
    15: {normal: lootTiers[3], rare: lootTiers[4], rareChance: 0.25},
    16: {normal: lootTiers[3], rare: lootTiers[4], rareChance: 0.5},
    17: {normal: lootTiers[4], rare: lootTiers[5], rareChance: 0.1},
    18: {normal: lootTiers[4], rare: lootTiers[5], rareChance: 0.25},
    19: {normal: lootTiers[4], rare: lootTiers[5], rareChance: 0.5},
    20: {normal: lootTiers[5], rare: lootTiers[5], rareChance: 0},
};

export default lootTables;