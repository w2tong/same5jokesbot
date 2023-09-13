import { bold } from 'discord.js';
import { getRandomRange } from '../util/util';
import { Dice, HitType, rollDice } from './util';

type CharacterStats = {
    attackBonus: number;
    damage: Dice;
    damageBonus: number;
    critRange: number;
    critMult: number;
    armorClass: number;
    physResist: number;
    magicResist: number;
    maxHealth: number;
    currHealth?: number;
    maxMana: number;
    currMana?: number;
    manaPerAtk: number;
    manaRegen: number;
    initiativeBonus: number;
}

class Character {
    protected _name: string;

    // Attack stats
    protected attackBonus: number;
    protected damage: Dice;
    protected damageBonus: number;
    protected critRange: number;
    protected critMult: number;

    // Defence stats
    protected _armorClass: number;
    protected physResist: number;
    protected magicResist: number;
    
    // Health
    protected maxHealth: number;
    protected currHealth: number;

    // Mana
    protected maxMana: number;
    protected currMana: number;
    protected manaPerAtk: number;
    protected manaRegen: number;

    protected _initiativeBonus: number;

    protected _target: Character|null = null;
    protected _index;

    constructor(stats: CharacterStats, name: string, index: number) {
        
        
        this.attackBonus = stats.attackBonus;
        this.damage = stats.damage;
        this.damageBonus = stats.damageBonus;
        this.critRange = stats.critRange;
        this.critMult = stats.critMult;

        this._armorClass = stats.armorClass;
        this.physResist = stats.physResist;
        this.magicResist = stats.magicResist;
        
        this.maxHealth = stats.maxHealth;
        this.currHealth = stats.currHealth ?? stats.maxHealth;

        this.maxMana = stats.maxMana;
        this.currMana = stats.currMana ?? 0;
        this.manaPerAtk = stats.manaPerAtk;
        this.manaRegen = stats.manaRegen;

        this._initiativeBonus = stats.initiativeBonus;

        this._name = name;
        this._index = index;
    }

    get name() {
        return this._name;
    }

    get armorClass() {
        return this._armorClass;
    }

    get initiativeBonus() {
        return this._initiativeBonus;
    }

    get target() {
        return this._target;
    }

    set target(char: Character | null) {
        this._target = char;
    }

    get index() {
        return this._index;
    }

    getHealthString() {
        return `${this.currHealth}/${this.maxHealth}`;
    }

    getManaString() {
        return `${this.currMana}/${this.maxMana}`;
    }

    getName() {
        return this.name;
    }

    getCharString() {
        return `${bold(this.getName())}\nHP: ${this.getHealthString()}${this.maxMana > 0 ? `\nMP: ${this.getManaString()}` : ''}`;
    }

    setRandomTarget(chars: Character[]) {
        if (chars.length === 0) {
            this.target = null;
        }
        else {
            this.target = chars[getRandomRange(chars.length)];
        }   
    }

    attackTarget(): {hit: HitType, attackDetails?: string, damage?: number} | null {
        if (this.target) { 
            const attackRoll = rollDice({num: 1, sides: 20});
            const rollToHitTaget = this.target.armorClass - this.attackBonus;

            const attackDetails = `${attackRoll} vs. ${rollToHitTaget <= 20 ? rollToHitTaget : 20}`;

            if (attackRoll === 1) {
                return {hit: HitType.CritMiss, attackDetails};
            }
            else if (attackRoll === 20 || attackRoll >= rollToHitTaget) {
                const damageRoll = rollDice(this.damage);
                let damage = damageRoll + this.damageBonus;
                let hitType = HitType.Hit;
                if (attackRoll >= this.critRange) {
                    damage *= this.critMult;
                    hitType = HitType.Crit;
                }
                const damageDone = this.target.takeDamage(damage);
                return {hit: hitType, attackDetails, damage: damageDone};
            }
            else {
                return {hit: HitType.Miss, attackDetails};
            }
        }
        return null;
    }

    takeDamage(damage: number): number {
        // calculate damage after physResist and magicResist
        this.currHealth -= damage;
        return damage;
    }

    isDead() {
        return this.currHealth <= 0;
    }
}

export default Character;
export { CharacterStats };