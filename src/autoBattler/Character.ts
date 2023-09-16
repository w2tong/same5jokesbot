import { bold, userMention } from 'discord.js';
import { getRandomRange } from '../util/util';
import { DamageType, Dice, HitType, dice, generateCombatAttack, rollDice } from './util';
import Battle, { Side } from './Battle';
import BuffTracker from './Buffs/BuffTracker';
import { BuffId } from './Buffs/buffs';

const healthBarLength = 10;
const manaBarLength = 10;

type CharacterStats = {
    level: number;
    attackBonus: number;
    damage: Dice;
    damageBonus: number;
    damageType: DamageType;
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

        this.level = stats.level;
        
        this.attackBonus = stats.attackBonus;
        this.damage = stats.damage;
        this.damageBonus = stats.damageBonus;
        this.damageType = stats.damageType;
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
    
    getName(): string {
        let name = this.name;
        if (this.userId) name += ` (${userMention(this.userId)})`;
        return name;
    }

    getClass(): string {
        return this.name;
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
            `Lvl. ${this.level} ${this.getClass()}`,
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
        else {
            lines.push('');
        }
        // Debuffs
        if (this.buffTracker.getDebuffCount() > 0) {
            lines.push(`Debuffs: ${this.buffTracker.getDebuffString()}`);
        }
        else {
            lines.push('');
        }

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
        this.setTarget();
        if (this.target) { 
            const attack = this.attackRoll();
            
            if (attack.hitType === HitType.Hit || attack.hitType === HitType.Crit) {
                const damageRoll = rollDice(this.damage);
                const sneakDamage = this.isInvisible() ? rollDice(dice['1d4']) : 0;
                let damage = damageRoll + this.damageBonus + sneakDamage;
                if (attack.hitType === HitType.Crit) damage *= this.critMult;
                this.battle.combatLog.add(generateCombatAttack(this.name, this.target.name, attack.details, attack.hitType, sneakDamage > 0));
                this.target.takeDamage(this.name, damage, this.damageType);
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

    takeDamage(source: string, damage: number, type: DamageType): void {
        // TODO: calculate damage after physResist and magicResist
        this.currHealth -= damage;
        this.battle.combatLog.add(`${bold(this.name)} took ${bold(damage.toString())} ${type} from ${bold(source)}.`);
        if (this.isDead()) {
            this.battle.setCharDead(this.side, this.index);
            this.battle.combatLog.add(`${bold(this.name)} died.`);
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
export { CharacterStats };