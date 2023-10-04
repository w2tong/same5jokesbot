import { bold, userMention } from 'discord.js';
import { getRandomRange } from '../util/util';
import { DamageType, HitType, calcStatValue, dice, generateCombatAttack, rollDice } from './util';
import Battle, { Side } from './Battle';
import BuffTracker from './Buffs/BuffTracker';
import { BuffId } from './Buffs/buffs';
import { CharacterStatTemplate } from './statTemplates';
import { Weapon } from './Equipment/Weapons';
import { Shield } from './Equipment/Shield';
import { Equipment } from './Equipment/Equipment';
import { userUpgrades } from '../upgrades/upgradeManager';
import { upgrades } from '../upgrades/upgrades';

const healthBarLength = 10;
const manaBarLength = 10;
const dualWieldPenalty = -2;
const offHandPenalty = -4;

class Character {
    private userId?: string;

    protected _name: string;
    protected className: string;

    protected level: number;

    protected _mainHand: Weapon;
    protected offHandWeapon?: Weapon;
    protected offHandShield?: Shield;

    // Defence stats
    protected _armourClass: number;
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
    protected manaRegen: number;
    protected manaCostReduction: number;

    protected _initiativeBonus: number;

    // Buffs/Debuffs
    protected _buffTracker: BuffTracker = new BuffTracker(this);

    // Battle Info
    protected _target: Character|null = null;
    protected _battle : {ref: Battle, side: Side, index: number} | null = null;

    constructor(level: number, stats: CharacterStatTemplate, equipment: Equipment, name: string, options?: {userId?: string, currHealthPc?: number, currManaPc?: number}) {
        this._name = name;
        this.className = stats.className;

        this.level = level;

        const lvlAttackBonus = calcStatValue(stats.attackBonus, level);
        const lvlDamageBonus = calcStatValue(stats.damageBonus, level);
        const lvlManaPerAtk = calcStatValue(stats.manaPerAtk, level);

        // Main hand weapon
        this._mainHand = Object.assign({}, equipment.mainHand);
        this._mainHand.attackBonus += lvlAttackBonus;
        this._mainHand.damageBonus += lvlDamageBonus;
        this._mainHand.manaPerAtk += lvlManaPerAtk;

        this._armourClass = calcStatValue(stats.armourClass, level);
        this.physDR = calcStatValue(stats.physDR, level);
        this.magicDR = calcStatValue(stats.magicDR, level);
        this.physResist = calcStatValue(stats.physResist, level);
        this.magicResist = calcStatValue(stats.magicResist, level);

        this.maxHealth = calcStatValue(stats.health, level);

        this.maxMana = stats.mana;
        this.currMana = options?.currManaPc ? Math.ceil(this.maxMana * options.currManaPc) : 0;
        this.manaCostReduction = 0;

        this.manaRegen = calcStatValue(stats.manaRegen, level) + (this._mainHand.manaRegen ?? 0);
        this._initiativeBonus = calcStatValue(stats.initiativeBonus, level);

        // Off hand weapon/shield
        if (equipment.offHandWeapon && equipment.offHandShield) {
            throw Error('cannot have both weapon and shield in offhand');
        }
        if (equipment.offHandWeapon) {
            this.mainHand.attackBonus += dualWieldPenalty;
            this.offHandWeapon = Object.assign({}, equipment.offHandWeapon);
            this.offHandWeapon.attackBonus += lvlAttackBonus + dualWieldPenalty + offHandPenalty;
            this.offHandWeapon.damageBonus += lvlDamageBonus;
            this.offHandWeapon.manaPerAtk += lvlManaPerAtk;
            this.manaRegen += this.offHandWeapon.manaRegen ?? 0;
        }
        else if (equipment.offHandShield) {
            const shield = equipment.offHandShield;
            this._armourClass += shield.armourClass;
            this.physDR += shield.physDR ?? 0;
            this.magicDR += shield.magicDR ?? 0;
            this.physResist += shield.physResist ?? 0;
            this.magicResist += shield.magicResist ?? 0;
        }

        // Armour
        if (equipment.armour) {
            this._armourClass += equipment.armour.armourClass;
            this.physDR += equipment.armour.physDR ?? 0;
            this.magicDR += equipment.armour.magicDR ?? 0;
            this.physResist += equipment.armour.physResist ?? 0;
            this.magicResist += equipment.armour.magicResist ?? 0;
            this.manaRegen += equipment.armour.manaRegen ?? 0;
        }

        // Head
        if (equipment.head) {
            this._armourClass += equipment.head.armourClass ?? 0;
            this.mainHand.manaPerAtk += equipment.head.manaPerAtk ?? 0;
            if (this.offHandWeapon) this.offHandWeapon.manaPerAtk += equipment.head.manaPerAtk ?? 0;
            this.manaRegen += equipment.head.manaRegen ?? 0;
            this.manaCostReduction += equipment.head.manaCostReduction ?? 0;
        }

        if (options?.userId) {
            const userId = options.userId;
            this.userId = userId;
            // Add user upgrades
            if (userUpgrades[userId]) {
                this.mainHand.attackBonus += upgrades.attackBonus.levels[userUpgrades[userId].attackBonus];
                if (this.offHandWeapon) this.offHandWeapon.attackBonus += upgrades.attackBonus.levels[userUpgrades[userId].attackBonus];
                this._armourClass += upgrades.armourClass.levels[userUpgrades[userId].armourClass];
                this.maxHealth += upgrades.health.levels[userUpgrades[userId].health];
            }
        }
        this.currHealth = options?.currHealthPc ? Math.ceil(this.maxHealth * options.currHealthPc) : this.maxHealth;
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

    get mainHand() {
        return this._mainHand;
    }

    get armourClass() {
        return this._armourClass;
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
        if (this.maxMana !== 0 && this.currMana >= this.maxMana - this.manaCostReduction) {
            this.specialAbility();
        }
        else {
            this.attack();
        }
        this.addMana(this.manaRegen);
        this.buffTracker.tick();
    }

    attackRoll(weapon: Weapon): {hitType: HitType, details: string} {
        if (!this.target) return {hitType: HitType.Miss, details: 'No Target'};
        const attackRoll = rollDice({num: 1, sides: 20});
        const rollToHitTaget = this.target.armourClass - weapon.attackBonus;
        const details = `${attackRoll} vs. ${rollToHitTaget <= 2 ? 2 : rollToHitTaget <= 20 ? rollToHitTaget : 20}`;
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
            let attack = this.attackRoll(this.mainHand);
            // Main hand attack
            if (attack.hitType === HitType.Hit || attack.hitType === HitType.Crit) {
                const damageRoll = rollDice(this.mainHand.damage);
                const sneakDamage = this.isInvisible() ? rollDice(dice['1d4']) : 0;
                let damage = damageRoll + this.mainHand.damageBonus + sneakDamage;
                if (attack.hitType === HitType.Crit) damage *= this.mainHand.critMult;
                this.battle.ref.combatLog.add(generateCombatAttack(this.name, this.target.name, attack.details, attack.hitType, sneakDamage > 0));
                this.target.takeDamage(this.name, damage, this.mainHand.damageType);
                if (this.mainHand.onHit) this.mainHand.onHit.func(this, this.target);
                this.addMana(this.mainHand.manaPerAtk);
            }
            else {
                this.battle.ref.combatLog.add(generateCombatAttack(this.name, this.target.name, attack.details, attack.hitType, false));
            }

            // Off hand attack
            if (this.offHandWeapon) {
                attack = this.attackRoll(this.offHandWeapon);
                if (attack.hitType === HitType.Hit || attack.hitType === HitType.Crit) {
                    const damageRoll = rollDice(this.offHandWeapon.damage);
                    const sneakDamage = this.isInvisible() ? rollDice(dice['1d4']) : 0;
                    let damage = damageRoll + this.offHandWeapon.damageBonus + sneakDamage;
                    if (attack.hitType === HitType.Crit) damage *= this.offHandWeapon.critMult;
                    this.battle.ref.combatLog.add(generateCombatAttack(this.name, this.target.name, attack.details, attack.hitType, sneakDamage > 0));
                    this.target.takeDamage(this.name, damage, this.offHandWeapon.damageType);
                    if (this.offHandWeapon.onHit) this.offHandWeapon.onHit.func(this, this.target);
                    this.addMana(this.offHandWeapon.manaPerAtk);
                }
                else {
                    this.battle.ref.combatLog.add(generateCombatAttack(this.name, this.target.name, attack.details, attack.hitType, false));
                }
            }
        }
    }

    // Default special ability
    specialAbility() {
        this.currMana -= (this.maxMana - this.manaCostReduction);
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

    info() {
        return {
            name: this.name,
            className: this.className,
            level: this.level,
            mainHand: this.mainHand,
            offHandWeapon: this.offHandWeapon,
            armourClass: this.armourClass,
            physDR: this.physDR,
            magicDR: this.magicDR,
            physResist: this.physResist,
            magicResist: this.magicResist,
            health: this.maxHealth,
            mana: this.maxMana,
            manaRegen: this.manaRegen,
            initiativeBonus: this.initiativeBonus
        };
    }
}

export default Character;