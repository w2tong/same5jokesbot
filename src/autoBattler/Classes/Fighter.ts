import { bold } from 'discord.js';
import Character from '../Character';

class Fighter extends Character {
    specialAbility(): void {
        if (!this.battle) return;
        this.setTarget();
        if (this.target) {
            this.currMana = 0;
            this.battle.ref.combatLog.add(`${bold(this.name)} used ${bold('Extra Attack')}.`);
            this.attack();
            this.attack();
        }
    }
}

export default Fighter;