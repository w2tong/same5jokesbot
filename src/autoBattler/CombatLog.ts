import { FieldValueCharLimit } from '../util/discordUtil';

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

export default CombatLog;