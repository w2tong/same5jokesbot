import { bold } from 'discord.js';
import { FieldValueCharLimit } from '../util/discordUtil';
import HitType from './HitType';

const logLength = 5;

class CombatLog {
    
    private log: string[] = [];
    private logLength = 0;
    private logIndex = 0;
    private fullLog: boolean = false;

    constructor(options?: {fullLog?: boolean}) {
        if (options) {
            if (options.fullLog) this.fullLog = options.fullLog;
        }
    }

    add(line: string) {
        this.log.push(line);
        this.logLength += line.length + 1;
        while (this.logLength > FieldValueCharLimit) {
            this.logLength -= this.log[this.logIndex++].length;
        }
    }

    getLog() {
        if (!this.log.length) return 'None';
        if (this.fullLog) return this.log.slice(this.logIndex).join('\n');
        return this.log.slice(-logLength).join('\n');
    }
}

function generateCombatAttack(charName: string, tarName: string, attackDetails: string, hitType: HitType, sneak: boolean) {
    return `${bold(charName)} ⚔️ ${bold(tarName)} (${attackDetails}). ${bold(hitType.toString())}${sneak ? ' (Sneak Attack)' : ''}.`;
}

export default CombatLog;
export { generateCombatAttack };