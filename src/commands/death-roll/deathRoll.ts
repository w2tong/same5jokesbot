import { EmbedBuilder, User, bold, time } from 'discord.js';
import { emptyEmbedFieldInline } from '../../util/discordUtil';
import { timeInMS } from '../../util/util';

const deathRollers = new Set<string>();
const rollButtonId = 'roll';
type Roll = {userId: string, roll: number};

class DeathRoll {
    private creator: User;
    private opponent: User;
    private amount: number;
    private startingRoll: number;
    private currentRoll: number;
    private turnUser: User;
    private rollHistory: Array<Roll> = [];
    private expired = false;
    private static _idleTimeout: number = 0.25 * timeInMS.minute;

    constructor(creator: User, opponent: User, amount: number, startingRoll: number) {
        this.creator = creator;
        this.opponent = opponent;
        this.amount = amount;
        this.startingRoll = this.currentRoll = startingRoll;
        this.turnUser = (Math.random() < 0.5) ? creator : opponent;
    }

    createEmbed(): EmbedBuilder {
        const turnUser = (this.turnUser === this.creator) ? this.creator : this.opponent;
        
        const embed = new EmbedBuilder()
            .setTitle(`Death Roll ${this.isEnded() ? `(Winner: ${turnUser.username})` : this.expired ? '(Expired)' : ''}`)
            .addFields(
                {name: 'Creator', value: `${this.creator}`, inline: true},
                {name: 'Opponent', value: `${this.opponent}`, inline: true},
                emptyEmbedFieldInline,
                {name: 'Points', value: `${this.amount.toLocaleString()}`, inline: true},
                {name: 'Starting Roll', value: `${this.startingRoll.toLocaleString()}`, inline: true},
                emptyEmbedFieldInline,
                this.currentRoll !== 1 ? {name: 'Turn', value: `${turnUser}`, inline: true} : {name: 'Winner', value: `${turnUser} wins ${this.amount.toLocaleString()} points`, inline: true},
                {name: 'Current Roll', value: `${this.currentRoll.toLocaleString()}`, inline: true},
                emptyEmbedFieldInline,
                {name: 'Roll History', value: this.rollHistory.length ? this.rollHistory.map(roll => `${roll.userId === this.creator.id ? this.creator : this.opponent} rolled ${bold(roll.roll.toLocaleString())}`).join('\n') : 'None'}
            );
        if (!this.isEnded()) {
            embed.addFields(
                {name: 'Expires', value: `${time(new Date(Date.now() + DeathRoll._idleTimeout), 'R')}`}
            );
        }
        return embed;
    }

    roll(userId: string): {correctUser: boolean, ended: boolean} {
        if (userId === this.turnUser.id) {
            this.turnUser = (this.turnUser === this.creator) ? this.opponent : this.creator;
            this.currentRoll = Math.ceil(Math.random() * this.currentRoll);
            this.rollHistory.push({userId, roll: this.currentRoll});
            if (this.currentRoll === 1) {
                return {correctUser: true, ended: true};
            }
            return {correctUser: true, ended: false};
        }
        return {correctUser: false, ended: false};
    }

    isEnded(): boolean {
        return this.currentRoll === 1;
    }

    expire(): void {
        this.expired = true;
    }

    isExpired(): boolean {
        return this.expired;
    }

    getResults() {
        return this.turnUser === this.creator ? {winnerId: this.creator.id, loserId: this.opponent.id} : {winnerId: this.opponent.id, loserId: this.creator.id};
    }

    static get idleTimeout() {
        return DeathRoll._idleTimeout;
    }
}

export { deathRollers, rollButtonId, DeathRoll };