import { EmbedBuilder, bold } from 'discord.js';
import Character from './Character';
import { HitType, dice, rollDice } from './util';
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
    private left: Character[];
    private leftAlive: Set<number>;

    private right: Character[];
    private rightAlive: Set<number> = new Set();

    private charTurn = 0;
    private turnOrder: {char: Character, init: number, side: Side}[] = [];

    private combatLog = new CombatLog();

    private winner?: Side; 

    constructor(left: Character[], right: Character[]) {
        this.left = left;
        this.leftAlive = new Set(Array(left.length).keys());

        this.right = right;
        this.rightAlive = new Set(Array(right.length).keys());
    }

    startCombat() {
        // Assign turn order for characters
        for (const char of this.left) {
            const init = rollDice(dice['1d20']) + char.initiativeBonus;
            this.turnOrder.push({char, init, side: Side.Left});
        }
        for (const char of this.right) {
            const init = rollDice(dice['1d20']) + char.initiativeBonus;
            this.turnOrder.push({char, init, side: Side.Right});
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
            const side = this.turnOrder[this.charTurn].side;

            // Set target if current character has no target
            if (char.target === null) {
                let targets: Character[];
                if (side === Side.Left) {
                    targets = Array.from(this.rightAlive.values()).map(i => this.right[i]);
                }
                else {
                    targets = Array.from(this.leftAlive.values()).map(i => this.left[i]);
                }
                char.setRandomTarget(targets);
            }

            // Attempt to attack target
            if (char.target !== null) {
                const result = char.attackTarget();
                if (result) {
                    if (result.hit === HitType.Hit || result.hit === HitType.Crit) {
                        this.combatLog.add(`${bold(char.name)} atk ${bold(char.target.name)} (${result.attackDetails}). ${bold((result.damage ?? 0).toString())} dmg${result.hit === HitType.Crit ? ' (Crit)' : ''}.`);
                    }
                    else {
                        this.combatLog.add(`${bold(char.name)} atk ${bold(char.target.name)} (${result.attackDetails}). ${bold(`${result.hit === HitType.CritMiss ? 'Crit ' : ''}Miss`)}.`);
                    }
                    
                    if (char.target.isDead()) {
                        this.combatLog.add(`${bold(char.target.getName())} died.`);
                        if (side === Side.Left) {
                            this.rightAlive.delete(char.target.index);
                        }
                        else {
                            this.leftAlive.delete(char.target.index);
                        }
                        char.target = null;
                    }
                }
            }
            this.charTurn++;
            if (this.charTurn >= this.turnOrder.length) this.charTurn = 0;
            return {combatEnded: false};
        }

        return res;
    }

    generateEmbed(): EmbedBuilder {
        const leftNames = this.left.map(char => char.getCharString());
        const rightNames = this.right.map(char => char.getCharString());

        const embed = new EmbedBuilder()
            .setTitle(`Auto Battle${this.winner ? ` (WINNER: ${bold(this.winner)})` : ''}`)
            .addFields(
                {name: 'Left', value: leftNames.join('\n\n'), inline: true},
                emptyEmbedFieldInline,
                {name: 'Right', value: rightNames.join('\n\n'), inline: true},

                // TODO: add character limit to combat log 
                {name: 'Combat Log', value: this.combatLog.getLog()}
            )
        ;

        return embed;
    }
}

export default Battle;