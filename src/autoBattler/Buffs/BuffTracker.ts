import { bold } from 'discord.js';
import Character from '../Character';
import { Buff } from './buffs';
import { Debuff } from './debuffs';

type BuffInfo = {
    duration: number;
    source: Character;
    new: boolean;
}

class BuffTracker {
    private char: Character;
    private buffs: {[id in Buff]?: BuffInfo} = {};
    private debuffs: {[id in Debuff]?: BuffInfo} = {};

    constructor(char: Character) {
        this.char = char;
    }

    getBuff(id: Buff): number {
        return this.buffs[id]?.duration ?? 0;
    }

    addBuff(id: Buff, duration: number, source: Character) {
        this.buffs[id] = {duration, source, new: true};
        this.char.battle.combatLog.add(`${this.char.name} gained buff ${id} (${duration}).`);
    }

    addDebuff(id: Debuff, duration: number, source: Character) {
        this.debuffs[id] = {duration, source, new: true};
        this.char.battle.combatLog.add(`${this.char.name} gained debuff ${bold(`${id} (${duration})`)}.`);
    }

    tick() {
        for (const [id, buff] of Object.entries(this.buffs)) {
            if (buff.new) buff.new = false;
            else buff.duration -= 1;

            if (buff.duration <= 0) {
                delete this.buffs[id as Buff];
                this.char.battle.combatLog.add(`${this.char.name} lost buff ${id}.`);
            }
        }

        // TODO: add tick for debuffs
        for (const [id, debuff] of Object.entries(this.debuffs)) {

            if (id as Debuff === Debuff.Burn) {
                this.char.takeDamage(Debuff.Burn, debuff.duration);
            }

            debuff.duration -= 1;

            if (debuff.duration <= 0) {
                delete this.buffs[id as Buff];
                this.char.battle.combatLog.add(`${this.char.name} lost buff ${id}.`);
            }
        }
    }
}

export default BuffTracker;