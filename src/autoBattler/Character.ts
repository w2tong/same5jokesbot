import { getRandomRange } from '../util/util';
import { rollDice } from './util';

class Character {
    private _name: string;
    private userId: string|null = null;

    // Attack stats
    private attackBonus: number;
    private damageMin: number;
    private damageMax: number;
    private damageBonus: number;

    // Defence stats
    private _armorClass: number;
    private physResist: number;
    private magicResist: number;
    
    // Health
    private maxHealth: number;
    private currHealth: number;

    // Mana
    private maxMana: number;
    private currMana: number;
    private manaPerAtk: number;
    private manaRegen: number;

    private _initiativeBonus: number;

    private _target: Character|null = null;
    private _index;

    constructor({name, userId, attackBonus, damageMin, damageMax, damageBonus, armorClass, physResist, magicResist, maxHealth, currHealth, maxMana, currMana, manaPerAtk, manaRegen, initiativeBonus, index}: {name: string, userId?: string, attackBonus: number, damageMin: number, damageMax: number, damageBonus: number, armorClass: number, physResist: number, magicResist: number, maxHealth: number, currHealth: number, maxMana: number, currMana: number, manaPerAtk: number, manaRegen: number, initiativeBonus: number, index: number}) {
        this._name = name;
        if (userId) this.userId = userId;
        this._armorClass = armorClass;
        this.attackBonus = attackBonus;
        this.damageMin = damageMin;
        this.damageMax = damageMax;
        this.damageBonus = damageBonus;
        this._initiativeBonus = initiativeBonus;
        this.maxHealth = maxHealth;
        this.currHealth = currHealth ?? maxHealth;
        this.maxMana = maxMana;
        this.currMana = currMana ?? maxMana;
        this.manaPerAtk = manaPerAtk;
        this.manaRegen = manaRegen;
        this.physResist = physResist;
        this.magicResist = magicResist;
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

    getFullName() {
        return `${this._name}${this.userId ? ` (${this.userId})` : ''}`;
    }

    getHealthString() {
        return `${this.currHealth}/${this.maxHealth}`;
    }

    setRandomTarget(chars: Character[]) {
        if (chars.length === 0) {
            this.target = null;
        }
        else {
            this.target = chars[getRandomRange({max: chars.length})];
        }   
    }

    attackTarget(): {hit: boolean, attackDetails?: string, damage?: number, damageDetails?: string} | null {
        if (this.target) {
            const attackRoll = rollDice(1, 20);
            const attack = attackRoll + this.attackBonus;
            const attackDetails = `${attack} (${attackRoll}${this.attackBonus ? `${this.attackBonus > 0 ? '+' : ''}${this.attackBonus}` : ''}) vs. ${this.target.armorClass}`;
            if (attack >= this.target.armorClass) {
                const damageRoll = getRandomRange({min: this.damageMin, max: this.damageMax});
                const damage = damageRoll + this.damageBonus;
                const damageDone = this.target.takeDamage(damage);
                // TODO: include resistances in damageDetails
                const damageDetails = `${damage} (${damageRoll}${this.damageBonus ? `${this.damageBonus > 0 ? '+' : ''}${this.damageBonus}` : ''})`;
                return {hit: true, attackDetails, damage: damageDone, damageDetails};
            }
            else {
                return {hit: false, attackDetails};
            }
        }
        return null;
    }

    takeDamage(damage: number): number {
        // calculate damage after physResist and magicResist
        console.log(Math.log(this.physResist), Math.log(this.magicResist));
        this.currHealth -= damage;
        return damage;
    }

    isDead() {
        return this.currHealth <= 0;
    }
}

export default Character;