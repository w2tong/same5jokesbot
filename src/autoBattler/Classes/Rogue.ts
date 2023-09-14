import { bold } from 'discord.js';
import Character from '../Character';
import { Buff } from '../Buffs/buffs';

class Rogue extends Character {
    specialAbility(): void {
        this.battle.combatLog.add(`${bold(this.name)} used ${bold('Sneak')}.`);
        this.buffTracker.addBuff(Buff.Invisible, 1);
    }
}

export default Rogue;