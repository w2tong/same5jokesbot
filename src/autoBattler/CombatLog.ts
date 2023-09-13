import { fieldValueCharLimit } from '../util/discordUtil';

class CombatLog {
    
    private log: string[] = [];
    private logLength = 0;
    private logIndex = 0;

    constructor() {}

    add(line: string) {
        this.log.push(line);
        this.logLength += line.length + 1;
        while (this.logLength > fieldValueCharLimit) {
            this.logLength -= this.log[this.logIndex++].length;
        }
    }

    getLog() {
        return this.log.length ? this.log.slice(this.logIndex).join('\n') : 'None';
    }
}

export default CombatLog;