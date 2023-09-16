import { bold } from 'discord.js';
import Character from '../Character';
import { DebuffId } from '../Buffs/buffs';
import { DamageType, HitType, generateCombatAttack, rollDice } from '../util';

class Wizard extends Character {
    getClass() {
        return 'Wizard';
    }

    specialAbility(): void {
        this.setTarget();
        if (this.target) {
            this.currMana = 0;
            this.battle.combatLog.add(`${bold(this.name)} casted ${bold('Firebolt')}.`);
            const attack = this.attackRoll();
            this.battle.combatLog.add(generateCombatAttack(this.name, this.target.name, attack.details, attack.hitType, false));
            if (attack.hitType === HitType.Hit || attack.hitType === HitType.Crit) {
                let damage = rollDice(this.damage) + this.damageBonus;
                if (attack.hitType === HitType.Crit) damage *= this.critMult;
                this.target.takeDamage(this.name, damage, DamageType.Magic);
                this.target?.buffTracker.addDebuff(DebuffId.Burn, 2, this);
            }
        }
    }
}

export default Wizard;