import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, InteractionEditReplyOptions, User } from 'discord.js';
import { emptyEmbedField } from './discordUtil';

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

    constructor(creator: User, opponent: User, amount: number, startingRoll: number) {
        this.creator = creator;
        this.opponent = opponent;
        this.amount = amount;
        this.startingRoll = this.currentRoll = startingRoll;
        this.turnUser = (Math.random() < 0.5) ? creator : opponent;
    }

    createReply(): InteractionEditReplyOptions {
        const turnUser = (this.turnUser === this.creator) ? this.creator : this.opponent;
        const embed = new EmbedBuilder()
            .setTitle(`Death Roll ${this.isEnded() ? `(Winner: ${turnUser.username})` : this.expired ? '(Expired)' : ''}`)
            .addFields(
                {name: 'Creator', value: `${this.creator}`, inline: true},
                {name: 'Opponent', value: `${this.opponent}`, inline: true},
                emptyEmbedField,
                {name: 'Points', value: `${this.amount}`, inline: true},
                {name: 'Starting Roll', value: `${this.startingRoll}`, inline: true},
                emptyEmbedField,
                {name: 'Current Roll', value: `${this.currentRoll}`, inline: true},
                this.currentRoll !== 1 ? {name: 'Turn', value: `${turnUser}`, inline: true} : {name: 'Winner', value: `${turnUser} wins ${this.amount} points`, inline: true},
                emptyEmbedField,
                {name: 'Roll History', value: this.rollHistory.length ? this.rollHistory.map(roll => `${roll.userId === this.creator.id ? this.creator : this.opponent} rolled ${roll.roll}`).join('\n') : 'None'}
            );
        const buttonsRow = new ActionRowBuilder<ButtonBuilder>();
        buttonsRow.addComponents(
            new ButtonBuilder()
                .setCustomId('roll')
                .setLabel(`Roll (${turnUser.username}'s turn)`)
                .setStyle(ButtonStyle.Success)
        );
        return {embeds: [embed], components: !this.isEnded() && !this.expired ? [buttonsRow] : []};
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

    getResults() {
        return this.turnUser === this.creator ? {winnerId: this.creator.id, loserId: this.opponent.id} : {winnerId: this.opponent.id, loserId: this.creator.id};
    }
}

export { deathRollers, rollButtonId, DeathRoll };