import { bold } from 'discord.js';
import Character from '../Character';
import { Buff, BuffId, Debuff, DebuffId } from './buffs';

type BuffInfo = {
    duration: number;
    source: Character;
    new: boolean;
}

class BuffTracker {
    private char: Character;
    private buffs: {[id in BuffId]?: BuffInfo} = {};
    private debuffs: {[id in DebuffId]?: BuffInfo} = {};

    constructor(char: Character) {
        this.char = char;
    }

    getBuffCount() {
        return Object.keys(this.buffs).length;
    }

    getDebuffCount() {
        return Object.keys(this.debuffs).length;
    }

    getBuff(id: BuffId): number {
        return this.buffs[id]?.duration ?? 0;
    }

    getBuffString(): string {
        const buffs = [];
        for (const [id, buff] of Object.entries(this.buffs)) {
            buffs.push(`${Buff[id as BuffId].symbol}(${buff.duration})`);
        }
        return buffs.join(', ');
    }

    getDebuffString(): string {
        const debuffs = [];
        for (const [id, debuff] of Object.entries(this.debuffs)) {
            debuffs.push(`${Debuff[id as DebuffId].symbol}(${debuff.duration})`);
        }
        return debuffs.join(', ');
    }

    addBuff(id: BuffId, duration: number, source: Character) {
        this.buffs[id] = {duration, source, new: true};
        this.char.battle.combatLog.add(`${this.char.name} gained buff ${id}(${duration}).`);
    }

    addDebuff(id: DebuffId, duration: number, source: Character) {
        this.debuffs[id] = {duration, source, new: true};
        this.char.battle.combatLog.add(`${this.char.name} gained debuff ${bold(`${id}(${duration})`)}.`);
    }

    tick() {
        for (const [id, buff] of Object.entries(this.buffs)) {
            if (buff.new) buff.new = false;
            else buff.duration -= 1;

            if (buff.duration <= 0) {
                delete this.buffs[id as BuffId];
                this.char.battle.combatLog.add(`${this.char.name} lost buff ${id}.`);
            }
        }

        // TODO: add tick for debuffs
        for (const [id, debuff] of Object.entries(this.debuffs)) {

            if (id as DebuffId === DebuffId.Burn) {
                this.char.takeDamage(Debuff.Burn.name, debuff.duration);
            }

            debuff.duration -= 1;

            if (debuff.duration <= 0) {
                delete this.buffs[id as BuffId];
                this.char.battle.combatLog.add(`${this.char.name} lost buff ${id}.`);
            }
        }
    }
}

export default BuffTracker;