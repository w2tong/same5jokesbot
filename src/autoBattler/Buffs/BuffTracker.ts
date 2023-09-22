import { bold } from 'discord.js';
import Character from '../Character';
import { Buff, BuffId, Debuff, DebuffId } from './buffs';
import { DamageType, dice, rollDice } from '../util';

const BurnDamage = dice['1d3'];
const PoisonDamage = 1;

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
        if (!this.char.battle) return;
        this.buffs[id] = {duration, source, new: true};
        this.char.battle.ref.combatLog.add(`${this.char.name} gained buff ${id}(${duration}).`);
    }

    addDebuff(id: DebuffId, duration: number, source: Character) {
        if (!this.char.battle) return;
        this.debuffs[id] = {duration, source, new: true};
        this.char.battle.ref.combatLog.add(`${this.char.name} gained debuff ${bold(`${id}(${duration})`)}.`);
    }

    tick() {
        if (!this.char.battle) return;
        for (const [id, buff] of Object.entries(this.buffs)) {
            if (buff.new) buff.new = false;
            else buff.duration -= 1;

            if (buff.duration <= 0) {
                delete this.buffs[id as BuffId];
                this.char.battle.ref.combatLog.add(`${this.char.name} lost buff ${id}.`);
            }
        }

        // TODO: add tick for debuffs
        for (const [id, debuff] of Object.entries(this.debuffs)) {
            // TODO: separate debuffs such as burn by source to calculate damage for each source
            if (id as DebuffId === DebuffId.Burn && this.debuffs.Burn) {
                this.char.takeDamage(Debuff.Burn.name, rollDice(BurnDamage) + this.debuffs.Burn.source.mainHand.damageBonus, DamageType.Magic);
            }
            if (id as DebuffId === DebuffId.Poison && this.debuffs.Poison) {
                this.char.takeDamage(Debuff.Poison.name, PoisonDamage, DamageType.Physical);
            }

            debuff.duration -= 1;

            if (debuff.duration <= 0) {
                delete this.debuffs[id as DebuffId];
                this.char.battle.ref.combatLog.add(`${this.char.name} lost debuff ${id}.`);
            }
        }
    }
}

export default BuffTracker;