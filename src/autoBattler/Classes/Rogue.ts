import { bold } from 'discord.js';
import Character from '../Character';
import { Buff } from '../Buffs/buffs';

class Rogue extends Character {
    specialAbility(): void {
        this.currMana = 0;
        this.battle.combatLog.add(`${bold(this.name)} used ${bold('Sneak')}.`);
        this.buffTracker.addBuff(Buff.Invisible, 1, this);
    }
}

export default Rogue;