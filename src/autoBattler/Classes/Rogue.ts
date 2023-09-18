import { bold } from 'discord.js';
import Character from '../Character';
import { BuffId } from '../Buffs/buffs';

class Rogue extends Character {
    specialAbility(): void {
        if (!this.battle) return;
        this.currMana = 0;
        this.battle.ref.combatLog.add(`${bold(this.name)} used ${bold('Sneak')}.`);
        this.buffTracker.addBuff(BuffId.Invisible, 1, this);
    }
}

export default Rogue;