import { EmbedBuilder, bold } from 'discord.js';
import Character from './Character';
import { dice, rollDice } from './util';
import { emptyEmbedFieldInline } from '../util/discordUtil';
import CombatLog from './CombatLog';

enum Side {
    Left = 'Left',
    Right = 'Right',
    Tie = 'Tie'
}

type TurnRes = {
    combatEnded: boolean;
    winner?: Side;
}

class Battle {
    private left: Character[] = [];
    private leftAlive: Set<number> = new Set();

    private right: Character[] = [];
    private rightAlive: Set<number> = new Set();

    private turnIndex = -1;
    private turnOrder: {char: Character, init: number}[] = [];

    private _combatLog;

    private winner?: Side; 

    get combatLog() {
        return this._combatLog;
    }

    constructor(left: Character[], right: Character[], options?: {fullLog?: boolean}) {
        this.left = left;
        this.leftAlive = new Set(Array(left.length).keys());
        for (let i = 0; i < this.left.length; i++) {
            this.left[i].setBattle(this, Side.Left, i);
        }

        this.right = right;
        this.rightAlive = new Set(Array(right.length).keys());
        for (let i = 0; i < this.right.length; i++) {
            this.right[i].setBattle(this, Side.Right, i);
        }

        this._combatLog = new CombatLog({fullLog: options?.fullLog});
    }

    getTargets(side: Side) {
        // Get alive chars
        return side === Side.Left ? Array.from(this.rightAlive.values()).map(i => this.right[i]) : Array.from(this.leftAlive.values()).map(i => this.left[i]);
    }

    setCharDead(side: Side, index: number) {
        let char: Character;
        if (side === Side.Left) {
            char = this.left[index];
            this.leftAlive.delete(index);
        }
        else {
            char = this.right[index];
            this.rightAlive.delete(index);
        }
        this.turnOrder = this.turnOrder.filter(c => c.char !== char);
    }

    startCombat() {
        // Assign turn order for characters
        for (const char of this.left) {
            const init = rollDice(dice['1d20']) + char.initiativeBonus;
            this.turnOrder.push({char, init});
        }
        for (const char of this.right) {
            const init = rollDice(dice['1d20']) + char.initiativeBonus;
            this.turnOrder.push({char, init});
        }
        this.turnOrder.sort((a, b) => b.init - a.init);
    }

    nextTurn(): TurnRes {
        const res: TurnRes = {combatEnded: false};
        if (this.leftAlive.size === 0 && this.rightAlive.size === 0) {
            this.winner = Side.Tie;
            res.combatEnded = true;
            res.winner = Side.Tie;
            this.combatLog.add(bold('Tie!'));
        }
        else if (this.leftAlive.size === 0) {
            this.winner = Side.Right;
            res.combatEnded = true;
            res.winner = Side.Right;
            this.combatLog.add(`${bold('Right')} wins!`);
        }
        else if (this.rightAlive.size === 0) {
            this.winner = Side.Left;
            res.combatEnded = true;
            res.winner = Side.Left;
            this.combatLog.add(`${bold('Left')} wins!`);
        }
        else {
            this.turnIndex++;
            if (this.turnIndex >= this.turnOrder.length) this.turnIndex = 0;
            const char = this.turnOrder[this.turnIndex].char;
            char.doTurn();

            return {combatEnded: false};
        }

        return res;
    }

    generateEmbed(): EmbedBuilder {
        const leftChars = this.left.map(char => char.getCharString());
        const rightChars = this.right.map(char => char.getCharString());

        const turnOrder = this.turnOrder.slice().map(charTurn => charTurn.char.name);
        if (this.turnIndex >= 0 && this.turnIndex < this.turnOrder.length) {
            turnOrder[this.turnIndex] = bold(`[${turnOrder[this.turnIndex]}]`);
        }

        const embed = new EmbedBuilder()
            .setTitle(`Auto Battle${this.winner ? ` (WINNER: ${bold(this.winner)})` : ''}`)
            .addFields(
                {name: 'Left', value: leftChars.join('\n\n'), inline: true},
                emptyEmbedFieldInline,
                {name: 'Right', value: rightChars.join('\n\n'), inline: true},

                {name: 'Turn Order', value: turnOrder && turnOrder.length ? turnOrder.join(', ') : 'N/A'},

                {name: 'Combat Log', value: this.combatLog.getLog()}
            )
        ;

        return embed;
    }
}

export default Battle;
export { Side };