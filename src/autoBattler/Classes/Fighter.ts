import { bold } from 'discord.js';
import Character from '../Character';

class Fighter extends Character {
    specialAbility(): void {
        this.setTarget();
        if (this.target) {
            this.currMana = 0;
            this.battle.combatLog.add(`${bold(this.name)} used ${bold('Extra Attack')}.`);
            this.attack();
            this.attack();
        }
    }
}

export default Fighter;