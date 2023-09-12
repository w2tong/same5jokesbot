import { EmbedBuilder } from 'discord.js';
import Character from './Character';
import { dice, rollDice } from './util';
import { emptyEmbedFieldInline } from '../util/discordUtil';

enum Side {
    Left = 'left',
    Right = 'right'
}

class Battle {
    private left: Character[];
    private leftAlive: Set<number>;

    private right: Character[];
    private rightAlive: Set<number> = new Set();

    private charTurn = 0;
    private turnOrder: {char: Character, init: number, side: Side}[] = [];
    private combatHistory: string[] = [];

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

    nextTurn(): {combatEnded: boolean, winner?: Side} {
        if (this.leftAlive.size === 0) {
            return {combatEnded: true, winner: Side.Right};
            // right wins
        }
        else if (this.rightAlive.size === 0) {
            return {combatEnded: true, winner: Side.Left};
        }
        else {
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
                    if (result.hit) {
                        this.combatHistory.push(`${char.name} hit ${char.target.name} (${result.attackDetails}) for ${result.damageDetails} damage.`);
                    }
                    else {
                        this.combatHistory.push(`${char.name} hit ${char.target.name} and missed (${result.attackDetails}).`);
                    }
                    // Remove target from alive characters and set target to null
                    if (char.target.isDead()) {
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
    }

    generateEmbed(): EmbedBuilder {
        const leftNames = this.left.map(char => char.getCharString());
        const rightNames = this.right.map(char => char.getCharString());

        const embed = new EmbedBuilder()
            .setTitle('auto battle')
            .addFields(
                {name: 'Combatants', value: leftNames.join('\n'), inline: true},
                emptyEmbedFieldInline,
                {name: 'Combatants', value: rightNames.join('\n'), inline: true},

                {name: 'Combat History', value: this.combatHistory.length ? this.combatHistory.join('\n') : 'None'}
            )
        ;

        return embed;
    }
}

export default Battle;