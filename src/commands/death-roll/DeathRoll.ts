import { Client, EmbedBuilder, User, bold, time } from 'discord.js';
import { emptyEmbedFieldInline } from '../../util/discordUtil';
import { timeInMS } from '../../util/util';

import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';
import { updateCringePoints } from '../../sql/tables/cringe_points';
import { updateProfits, ProfitType } from '../../sql/tables/profits';

type DeathRollEvents = {
    end: (winner: User, loser: User, wager: number, client: Client, channelId: string) => Promise<void>
  }
const deathRollEmitter = new EventEmitter() as TypedEmitter<DeathRollEvents>;

const deathRollers = new Set<string>();
const rollButtonId = 'roll';
type Roll = {userId: string, roll: number};

class DeathRoll {
    private creator: User;
    private opponent: User;
    private wager: number;
    private startingRoll: number;
    private currentRoll: number;
    private _turnUser: User;
    private rollHistory: Roll[] = [];
    private expired = false;
    private static _idleTimeout: number = 60 * timeInMS.minute;
    private client: Client;
    private channelId: string;

    constructor(creator: User, opponent: User, wager: number, startingRoll: number, client: Client, channelId: string) {
        this.creator = creator;
        this.opponent = opponent;
        this.wager = wager;
        this.startingRoll = this.currentRoll = startingRoll;
        this._turnUser = (Math.random() < 0.5) ? creator : opponent;
        this.client = client;
        this.channelId = channelId;
    }

    createEmbed(): EmbedBuilder {
        const turnUser = (this.turnUser === this.creator) ? this.creator : this.opponent;
        
        const embed = new EmbedBuilder()
            .setTitle(`Death Roll ${this.isEnded() ? `(Winner: ${turnUser.username})` : this.expired ? '(Expired)' : ''}`)
            .addFields(
                {name: 'Creator', value: `${this.creator}`, inline: true},
                {name: 'Opponent', value: `${this.opponent}`, inline: true},
                emptyEmbedFieldInline,
                {name: 'Points', value: `${this.wager.toLocaleString()}`, inline: true},
                {name: 'Starting Roll', value: `${this.startingRoll.toLocaleString()}`, inline: true},
                emptyEmbedFieldInline,
                this.currentRoll !== 1 ? {name: 'Turn', value: `${turnUser}`, inline: true} : {name: 'Winner', value: `${turnUser} wins ${this.wager.toLocaleString()} points`, inline: true},
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

    async roll(userId: string): Promise<{ correctUser: boolean; ended: boolean; }> {
        if (userId === this.turnUser.id) {
            this._turnUser = (this.turnUser === this.creator) ? this.opponent : this.creator;
            this.currentRoll = Math.ceil(Math.random() * this.currentRoll);
            this.rollHistory.push({userId, roll: this.currentRoll});
            if (this.currentRoll === 1) {
                const {winner, loser} = this.getResults();
                deathRollEmitter.emit('end', winner, loser, this.wager, this.client, this.channelId);
                await updateCringePoints([
                    {userId: winner.id, points: this.wager},
                    {userId: loser.id, points: -this.wager}
                ]);
                void updateProfits([
                    {userId: winner.id, type: ProfitType.DeathRoll, profit: this.wager},
                    {userId: loser.id, type: ProfitType.DeathRoll, profit: -this.wager}
                ]);
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
        return this._turnUser === this.creator ? {winner: this.creator, loser: this.opponent} : {winner: this.opponent, loser: this.creator};
    }
    get turnUser(){
        return this._turnUser;
    }

    static get idleTimeout() {
        return DeathRoll._idleTimeout;
    }
}

export { deathRollers, rollButtonId, DeathRoll, deathRollEmitter };