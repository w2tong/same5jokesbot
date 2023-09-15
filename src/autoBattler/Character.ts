import { bold, userMention } from 'discord.js';
import { getRandomRange } from '../util/util';
import { Dice, HitType, dice, generateCombatAttack, rollDice } from './util';
import Battle, { Side } from './Battle';
import BuffTracker from './Buffs/BuffTracker';
import { Buff } from './Buffs/buffs';

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

    // Buffs/Debuffs
    protected _buffTracker: BuffTracker = new BuffTracker(this);

    // Battle Info
    protected _target: Character|null = null;
    protected _index;
    protected side: Side;
    protected _battle: Battle;

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
        this._battle = battle;
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

    get buffTracker() {
        return this._buffTracker;
    }

    set target(char: Character | null) {
        this._target = char;
    }

    get index() {
        return this._index;
    }

    get battle() {
        return this._battle;
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
        const lines = [];
        // Name
        lines.push(`${bold(this.getName())}${this.isDead() ? ' 💀' : ''}`);
        // HP
        lines.push(`HP: ${this.getHealthString()}`);
        // MP
        if (this.maxMana > 0) lines.push(`MP: ${this.getManaString()}`);
        // TODO: Buff
        // TODO: Debuff

        return lines.join('\n');
    }

    setRandomTarget(chars: Character[]) {
        if (chars.length === 0) {
            this.target = null;
        }
        else {
            this.target = chars[getRandomRange(chars.length)];
        }   
    }

    setTarget() {
        if (this.target?.isDead() || this.target?.isInvisible()) {
            this.target = null;
        }
        if (!this.target) {
            // TODO: add condition if this char can see invisible targets
            // Filter out invisble targets
            const targets = this.battle.getTargets(this.side).filter(char => !char.isInvisible());
            this.setRandomTarget(targets);
        }
    }

    doTurn() {
        if (this.maxMana !== 0 && this.currMana === this.maxMana) {
            this.specialAbility();
        }
        else {
            this.attack();
        }
        this.addMana(this.manaRegen);
        this.buffTracker.tick();
    }

    attackRoll(): {hitType: HitType, details: string} {
        if (!this.target) return {hitType: HitType.Miss, details: 'No Target'};
        const attackRoll = rollDice({num: 1, sides: 20});
        const rollToHitTaget = this.target.armorClass - this.attackBonus;
        const details = `${attackRoll} vs. ${rollToHitTaget <= 20 ? rollToHitTaget : 20}`;
        if (attackRoll === 1) {
            return {hitType: HitType.CritMiss, details};
        }
        else if (attackRoll === 20) {
            return {hitType: HitType.Crit, details};
        }
        else if (attackRoll >= rollToHitTaget) {
            return {hitType: HitType.Hit, details};
        }
        else {
            return {hitType: HitType.Miss, details};
        }
    }

    attack() {
        this.setTarget();
        if (this.target) { 
            const attack = this.attackRoll();
            
            if (attack.hitType === HitType.Hit || attack.hitType === HitType.Crit) {
                const damageRoll = rollDice(this.damage);
                const sneakDamage = this.isInvisible() ? rollDice(dice['1d4']) : 0;
                let damage = damageRoll + this.damageBonus + sneakDamage;
                if (attack.hitType === HitType.Crit) damage *= this.critMult;
                this.battle.combatLog.add(generateCombatAttack(this.name, this.target.name, attack.details, attack.hitType, sneakDamage > 0));
                this.target.takeDamage(this.name, damage);
                this.addMana(this.manaPerAtk);
            }
            else {
                this.battle.combatLog.add(generateCombatAttack(this.name, this.target.name, attack.details, attack.hitType, false));
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
        this.battle.combatLog.add(`${bold(this.name)} took ${bold(damage.toString())} damage from ${bold(source)}.`);
        if (this.isDead()) {
            this.battle.setCharDead(this.side, this.index);
            this.battle.combatLog.add(`${bold(this.name)} died.`);
        }
    }

    addMana(mana: number) {
        this.currMana = Math.min(this.currMana + mana, this.maxMana);
    }

    isDead() {
        return this.currHealth <= 0;
    }

    isInvisible() {
        return this.buffTracker.getBuff(Buff.Invisible) > 0;
    }
}

export default Character;
export { CharacterStats };