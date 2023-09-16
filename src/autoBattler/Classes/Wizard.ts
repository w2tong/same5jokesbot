import { bold } from 'discord.js';
import Character from '../Character';
import { DebuffId } from '../Buffs/buffs';
import { HitType, rollDice } from '../util';

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
            if (attack.hitType === HitType.Hit || attack.hitType === HitType.Crit) {
                let damage = rollDice(this.damage);
                if (attack.hitType === HitType.Crit) damage *= this.critMult;
                this.target.takeDamage(this.name, damage);
                this.target?.buffTracker.addDebuff(DebuffId.Burn, 3, this);
            }
        }
    }
}

export default Wizard;