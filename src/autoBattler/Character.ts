import { bold, userMention } from 'discord.js';
import { getRandomRange } from '../util/util';
import { Dice, HitType, generateCombatAttack, rollDice } from './util';
import Battle, { Side } from './Battle';

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
    private userId?: string;

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
    protected side: Side;
    protected battle: Battle;

    constructor(stats: CharacterStats, name: string, index: number, side: Side, battle: Battle, userId?: string) {
        if (userId) this.userId = userId;

        this._name = name;
        
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

        this._index = index;
        this.side = side;
        this.battle = battle;
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
        let name = this.name;
        if (this.userId) name += ` (${userMention(this.userId)})`;
        return name;
    }

    getCharString() {
        return `${bold(this.getName())}${this.isDead() ? ' 💀' : ''}\nHP: ${this.getHealthString()}${this.maxMana > 0 ? `\nMP: ${this.getManaString()}` : ''}`;
    }

    setRandomTarget(chars: Character[]) {
        if (chars.length === 0) {
            this.target = null;
        }
        else {
            this.target = chars[getRandomRange(chars.length)];
        }   
    }

    doTurn() {
        if (this.maxMana !== 0 && this.currMana === this.maxMana) {
            this.currMana = 0;
            this.specialAbility();
        }
        else {
            this.attack();
        }
        this.addMana(this.manaRegen);
    }

    attack() {
        if (this.target?.isDead()) {
            this.target = null;
        }
        if (!this.target) {
            this.setRandomTarget(this.battle.getTargets(this.side));
        }
        if (this.target) { 
            const attackRoll = rollDice({num: 1, sides: 20});
            const rollToHitTaget = this.target.armorClass - this.attackBonus;
            const attackDetails = `${attackRoll} vs. ${rollToHitTaget <= 20 ? rollToHitTaget : 20}`;

            if (attackRoll === 1) {
                this.battle.combatLogAdd(generateCombatAttack(this.name, this.target.name, attackDetails, HitType.CritMiss));
            }
            else if (attackRoll === 20 || attackRoll >= rollToHitTaget) {
                const damageRoll = rollDice(this.damage);
                let damage = damageRoll + this.damageBonus;
                let hitType = HitType.Hit;
                if (attackRoll >= this.critRange) {
                    damage *= this.critMult;
                    hitType = HitType.Crit;
                }
                this.battle.combatLogAdd(generateCombatAttack(this.name, this.target.name, attackDetails, hitType));
                this.target.takeDamage(this.name, damage);
                this.addMana(this.manaPerAtk);
            }
            else {
                this.battle.combatLogAdd(generateCombatAttack(this.name, this.target.name, attackDetails, HitType.Miss));
            }
        }
    }

    // Default special ability
    specialAbility() {
        this.currMana = 0;
        this.attack();        
    }

    takeDamage(source: string, damage: number) {
        // calculate damage after physResist and magicResist
        this.currHealth -= damage;
        this.battle.combatLogAdd(`${bold(this.name)} took ${bold(damage.toString())} damage from ${bold(source)}.`);
        if (this.isDead()) {
            this.battle.setCharDead(this.side, this.index);
            this.battle.combatLogAdd(`${bold(this.name)} died.`);
        }
    }

    addMana(mana: number) {
        this.currMana = Math.min(this.currMana + mana, this.maxMana);
    }

    isDead() {
        return this.currHealth <= 0;
    }
}

export default Character;
export { CharacterStats };