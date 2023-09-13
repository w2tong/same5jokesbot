import { EmbedBuilder, bold } from 'discord.js';
import Character from './Character';
import { dice, rollDice } from './util';
import { emptyEmbedFieldInline } from '../util/discordUtil';
import CombatLog from './CombatLog';

enum Side {
    Left = 'Left',
    Right = 'Right'
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

    private charTurn = 0;
    private turnOrder: {char: Character, init: number}[] = [];

    private combatLog = new CombatLog();

    private winner?: Side; 

    addChars(left: Character[], right: Character[]) {
        this.left = left;
        this.leftAlive = new Set(Array(left.length).keys());

        this.right = right;
        this.rightAlive = new Set(Array(right.length).keys());
    }

    getTargets(side: Side) {
        if (side === Side.Left) {
            return Array.from(this.rightAlive.values()).map(i => this.right[i]);
        }
        else {
            return Array.from(this.leftAlive.values()).map(i => this.left[i]);
        }
    }

    setCharDead(side: Side, index: number) {
        if (side === Side.Left) {
            this.leftAlive.delete(index);
        }
        else {
            this.rightAlive.delete(index);
        }
    }

    combatLogAdd(str: string) {
        this.combatLog.add(str);
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
        if (this.leftAlive.size === 0) {
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
            // Remove dead characters from turnOrder
            while (this.turnOrder[this.charTurn].char.isDead()) {
                this.turnOrder.splice(this.charTurn, 1);
                if (this.charTurn >= this.turnOrder.length) {
                    this.charTurn = 0;
                }
            }

            const char = this.turnOrder[this.charTurn].char;
            char.doTurn();

            this.charTurn++;
            if (this.charTurn >= this.turnOrder.length) this.charTurn = 0;
            return {combatEnded: false};
        }

        return res;
    }

    generateEmbed(): EmbedBuilder {
        const leftChars = this.left.map(char => char.getCharString());
        const rightChars = this.right.map(char => char.getCharString());

        const embed = new EmbedBuilder()
            .setTitle(`Auto Battle${this.winner ? ` (WINNER: ${bold(this.winner)})` : ''}`)
            .addFields(
                {name: 'Left', value: leftChars.join('\n\n'), inline: true},
                emptyEmbedFieldInline,
                {name: 'Right', value: rightChars.join('\n\n'), inline: true},

                //TODO: add turn order eg. [Player1], Player2, brackets indicates whos turn it is
                // {name: 'Turn Order' value: turnOrder},

                {name: 'Combat Log', value: this.combatLog.getLog()}
            )
        ;

        return embed;
    }
}

export default Battle;
export { Side };