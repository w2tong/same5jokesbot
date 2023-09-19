import { bold, userMention } from 'discord.js';
import { getRandomRange } from '../util/util';
import { DamageType, Dice, HitType, calcStatValue, dice, generateCombatAttack, rollDice } from './util';
import Battle, { Side } from './Battle';
import BuffTracker from './Buffs/BuffTracker';
import { BuffId } from './Buffs/buffs';
import { CharacterStatTemplate } from './statTemplates';

const healthBarLength = 10;
const manaBarLength = 10;

class Character {
    private userId?: string;

    protected _name: string;
    protected className: string;

    protected level: number;

    // Attack stats
    protected attackBonus: number;
    protected damage: Dice;
    protected damageBonus: number;
    protected damageType: DamageType;
    protected critRange: number;
    protected critMult: number;

    // Defence stats
    protected _armorClass: number;
    protected physDR: number;
    protected magicDR: number;
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
    protected _battle : {ref: Battle, side: Side, index: number} | null = null;

    constructor(level: number, stats: CharacterStatTemplate, name: string, options?: {userId?: string, currHealthPc?: number, currManaPc?: number}) {
        if (options?.userId) this.userId = options.userId;

        this._name = name;
        this.className = stats.className;

        this.level = level;

        this.attackBonus = calcStatValue(stats.attackBonus, level);
        this.damageType = stats.damageType;
        this.damage = stats.damage;
        this.damageBonus = calcStatValue(stats.damageBonus, level);
        this.critRange = stats.critRange;
        this.critMult = stats.critMult;

        this._armorClass = calcStatValue(stats.armorClass, level);
        this.physDR = calcStatValue(stats.physDR, level);
        this.magicDR = calcStatValue(stats.magicDR, level);
        this.physResist = calcStatValue(stats.physResist, level);
        this.magicResist = calcStatValue(stats.magicResist, level);
        
        this.maxHealth = calcStatValue(stats.health, level);
        this.currHealth = options?.currHealthPc ? Math.ceil(this.maxHealth * options.currHealthPc) : this.maxHealth;

        this.maxMana = stats.mana;
        this.currMana = options?.currManaPc ? Math.ceil(this.maxMana * options.currManaPc) : 0;

        this.manaPerAtk = calcStatValue(stats.manaPerAtk, level);
        this.manaRegen = calcStatValue(stats.manaRegen, level);
        this._initiativeBonus = calcStatValue(stats.initiativeBonus, level);
    }

    setBattle(ref: Battle, side: Side, index: number) {
        this._battle = {
            ref,
            side,
            index
        };
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

    get battle() {
        return this._battle;
    }

    get buffTracker() {
        return this._buffTracker;
    }
    
    getName(): string {
        let name = this.name;
        if (this.userId) name += ` (${userMention(this.userId)})`;
        return name;
    }

    getHealthString(): string {
        return `${this.currHealth}/${this.maxHealth}`;
    }

    getManaString(): string {
        return `${this.currMana}/${this.maxMana}`;
    }

    getHealthBar(): string {
        const numGreen = Math.ceil((this.currHealth >= 0 ? this.currHealth : 0)/this.maxHealth*healthBarLength);
        const numRed = healthBarLength - numGreen;
        return '🟩'.repeat(numGreen) + '🟥'.repeat(numRed);
    }

    getManaBar(): string {
        const numBlue = Math.ceil(this.currMana/this.maxMana*manaBarLength);
        const numWhite = manaBarLength - numBlue;
        return '🟦'.repeat(numBlue) + '⬜'.repeat(numWhite);
    }

    getCharString(): string {
        const lines = [
            // Name
            `${bold(this.getName())}${this.isDead() ? ' 💀' : ''}`,
            // Level and Class
            `Lvl. ${this.level} ${this.className}`,
            // HP
            `${this.getHealthBar()} ${this.getHealthString()}`
        ];

        // MP
        if (this.maxMana > 0) {
            lines.push(`${this.getManaBar()} ${this.getManaString()}`);
        }
        // Buffs
        if (this.buffTracker.getBuffCount() > 0) {
            lines.push(`Buffs: ${this.buffTracker.getBuffString()}`);
        }
        // else {
        //     lines.push('');
        // }
        // Debuffs
        if (this.buffTracker.getDebuffCount() > 0) {
            lines.push(`Debuffs: ${this.buffTracker.getDebuffString()}`);
        }
        // else {
        //     lines.push('');
        // }

        return lines.join('\n');
    }

    setRandomTarget(chars: Character[]): void {
        if (chars.length === 0) {
            this.target = null;
        }
        else {
            this.target = chars[getRandomRange(chars.length)];
        }   
    }

    setTarget(): void {
        if (!this.battle) return;
        if (this.target?.isDead() || this.target?.isInvisible()) {
            this.target = null;
        }
        if (!this.target) {
            // TODO: add condition if this char can see invisible targets
            // Filter out invisble targets
            const targets = this.battle.ref.getTargets(this.battle.side).filter(char => !char.isInvisible());
            this.setRandomTarget(targets);
        }
    }

    doTurn(): void {
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

    attack(): void {
        if (!this.battle) return;
        this.setTarget();
        if (this.target) { 
            const attack = this.attackRoll();
            
            if (attack.hitType === HitType.Hit || attack.hitType === HitType.Crit) {
                const damageRoll = rollDice(this.damage);
                const sneakDamage = this.isInvisible() ? rollDice(dice['1d4']) : 0;
                let damage = damageRoll + this.damageBonus + sneakDamage;
                if (attack.hitType === HitType.Crit) damage *= this.critMult;
                this.battle.ref.combatLog.add(generateCombatAttack(this.name, this.target.name, attack.details, attack.hitType, sneakDamage > 0));
                this.target.takeDamage(this.name, damage, this.damageType);
                this.addMana(this.manaPerAtk);
            }
            else {
                this.battle.ref.combatLog.add(generateCombatAttack(this.name, this.target.name, attack.details, attack.hitType, false));
            }
        }
    }

    // Default special ability
    specialAbility() {
        this.currMana = 0;
        this.attack();        
    }

    takeDamage(source: string, damage: number, type: DamageType): void {
        if (!this.battle) return;
        let damageResisted = 0;
        if (type === DamageType.Physical) {
            damageResisted = Math.round(damage * this.physResist/100);
        }
        else if (type === DamageType.Magic) {
            damageResisted = Math.round(damage * this.magicResist/100);
        }
        damage -= damageResisted;
        this.currHealth -= damage;
        this.battle.ref.combatLog.add(`${bold(this.name)} took ${bold(damage.toString())} ${type}${damageResisted > 0 ? ` (${damageResisted} resisted)` : ''} from ${bold(source)}.`);
        if (this.isDead()) {
            this.battle.ref.setCharDead(this.battle.side, this.battle.index);
            this.battle.ref.combatLog.add(`${bold(this.name)} died.`);
        }
    }

    addMana(mana: number): void {
        this.currMana = Math.min(this.currMana + mana, this.maxMana);
    }

    isDead(): boolean {
        return this.currHealth <= 0;
    }

    isInvisible(): boolean {
        return this.buffTracker.getBuff(BuffId.Invisible) > 0;
    }
}

export default Character;