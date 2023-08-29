import { EmbedBuilder, time, userMention } from 'discord.js';
import { Value } from '../../cards/Card';
import Deck from '../../cards/Deck';
import Hand from '../../cards/Hand';
import { emptyEmbedField, emptyEmbedFieldInline } from '../../util/discordUtil';
import { updateCringePoints } from '../../sql/tables/cringe-points';
import { timeInMS } from '../../util/util';
import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';

type BlackjackEvents = {
    end: (userId: string, wager: number, profit: number, channelId: string) => Promise<void>
  }
const blackjackEmitter = new EventEmitter() as TypedEmitter<BlackjackEvents>;

const maxWager = 1_000_000;
const maxDecks = 100;
const blackjackPayoutRate = 1.5;

const PlayerOptions = {
    Hit: 'Hit',
    Stand: 'Stand',
    Double: 'Double',
    Split: 'Split'
} as const;
type PlayerOption = typeof PlayerOptions[keyof typeof PlayerOptions];

const EndGameResults = {
    Win: 'Won',
    Lose: 'Lost',
    Tie: 'Tie'
} as const;
type EndGameResult = typeof EndGameResults[keyof typeof EndGameResults];

const cardValueMap: {[key in Value]: number} = {
    'A': 11,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    'J': 10,
    'Q': 10,
    'K': 10,
};
class BlackjackGame {

    private userId: string;
    private username: string;
    private balance: number;
    private wager: number;
    private deck: Deck = new Deck();
    private numOfDecks: number;
    private playerHand: Hand;
    private playerHandValue: number = 0;
    private dealerHand: Hand = new Hand(process.env.CLIENT_ID ?? '0');
    private dealerHandValue: number = 0;
    private lastAction: PlayerOption|undefined;
    private ended: boolean = false;
    private result: EndGameResult|undefined;
    private payout: number = 0;
    private static _idleTimeout: number = 15 * timeInMS.minute;
    private channelId: string;

    constructor(userId: string, username: string, numOfDecks: number, wager: number, balance: number, channelId: string) {
        this.userId = userId;
        this.username = username;
        this.wager = wager;
        this.deck = new Deck(numOfDecks);
        this.numOfDecks = numOfDecks;
        this.balance = balance;
        this.playerHand = new Hand(userId);
        this.payout = wager;
        this.channelId = channelId;
    }

    async startGame() {
        this.deck.shuffle();
        // Draw starting cards
        this.drawPlayerCard();
        this.drawDealerCard();
        this.drawPlayerCard();
        this.drawDealerCard();

        if (this.playerHandValue === 21 && this.dealerHandValue === 21) {
            await this.endGame(EndGameResults.Tie);
        }
        else if (this.playerHandValue === 21) {
            this.payout *= blackjackPayoutRate;
            await this.endGame(EndGameResults.Win);
        }
        else if (this.dealerHandValue === 21) {
            await this.endGame(EndGameResults.Lose);
        }
    }

    async endGame(result: EndGameResult) {
        let profit = 0;
        if (result === EndGameResults.Win) {
            profit = this.payout;
            await updateCringePoints([{userId: this.userId, points: this.payout}]);
            if (process.env.CLIENT_ID) await updateCringePoints([{userId: process.env.CLIENT_ID, points: -this.payout}]);
        }
        else if (result === EndGameResults.Lose) {
            profit = -this.wager;
            await updateCringePoints([{userId: this.userId, points: -this.wager}]);
            if (process.env.CLIENT_ID) await updateCringePoints([{userId: process.env.CLIENT_ID, points: this.wager}]);
        }
        this.result = result;
        this.ended = true;
        blackjackEmitter.emit('end', this.userId, this.wager, profit, this.channelId);
    }

    async input(option: PlayerOption): Promise<{valid: boolean, msg?: string}> {
        this.lastAction = option;
        if (option === PlayerOptions.Hit) {
            this.drawPlayerCard();
            if (this.playerHandValue > 21) {
                await this.endGame(EndGameResults.Lose);
            }
            else if (this.playerHandValue === 21) {
                await this.input('Stand');
            }
        }
        else if (option === PlayerOptions.Split) {
            return {valid: false, msg: 'This doesn\'t do anything right now.'};
        }
        else {
            if (option === PlayerOptions.Double) {
                if (this.balance <= this.wager * 2) {
                    return {valid: false, msg: `You do not have enough points to Double Down (Balance: ${this.balance.toLocaleString()}).`};
                }
                this.wager *= 2;
                this.payout = this.wager;

                this.drawPlayerCard();
                if (this.playerHandValue > 21) {
                    await this.endGame(EndGameResults.Lose);
                    return {valid: true};
                }
            }

            // Dealer's Turn
            while (this.dealerHandValue < 17) {
                this.drawDealerCard();
            }

            if (this.dealerHandValue > 21) {
                await this.endGame(EndGameResults.Win);
            }
            else if (this.dealerHandValue < this.playerHandValue) {
                await this.endGame(EndGameResults.Win);
            }
            else if (this.dealerHandValue > this.playerHandValue) {
                await this.endGame(EndGameResults.Lose);
            }
            else {
                await this.endGame(EndGameResults.Tie);
            }
        }
        return {valid: true};
    }

    createEmbed(): EmbedBuilder {
        const dealerCardsFieldValue = !this.ended ? 
            this.dealerHand.cards.map((card, i) => {
                if (i === 0) return card;
                else return '?';
            }).join('\t') :
            this.dealerHand;

        const dealerValueFieldValue = !this.ended ?
            cardValueMap[this.dealerHand.cards[0].value] :
            this.dealerHandValue;

        const embed =  new EmbedBuilder()
            .setTitle(`${this.username}'s Blackjack Game${this.ended ? ` (${this.result})` : ''}`)
            .addFields(
                {name: 'Player', value: `${userMention(this.userId)}`, inline: true},
                emptyEmbedFieldInline,
                {name: 'Decks', value: `${this.numOfDecks}`, inline: true},
                
                {name: 'Last Action', value: `${this.lastAction ? this.lastAction : 'N/A'}`, inline: true},
                emptyEmbedFieldInline,
                {name: 'Wager', value: this.wager.toLocaleString(), inline: true},

                {name: 'Dealer Cards', value: `${dealerCardsFieldValue}`, inline: true},
                emptyEmbedFieldInline,
                {name: 'Dealer Value', value: `${dealerValueFieldValue}`, inline: true},

                {name: 'Player Cards', value: `${this.playerHand}`, inline: true},
                emptyEmbedFieldInline,
                {name: 'Player Value', value: `${this.playerHandValue}`, inline: true},
            );

        if (!this.ended) {
            embed.addFields(
                emptyEmbedField,
                {name: 'Expires', value: `${time(new Date(Date.now() + BlackjackGame._idleTimeout), 'R')}`}
            );
        }

        if (this.ended) {
            let balanceFieldValue = this.balance.toLocaleString();
            let newBalance = this.balance;
            if (this.result === EndGameResults.Tie) {
                balanceFieldValue += ' (0)';
            }
            else {
                if (this.result === EndGameResults.Win) {
                    balanceFieldValue += ` (+${(this.payout).toLocaleString()})`;
                    newBalance += this.payout;
                }
                else if (this.result === EndGameResults.Lose) {
                    balanceFieldValue += ` (-${this.payout.toLocaleString()})`;
                    newBalance -= this.payout;
                }
            }
            embed.addFields(
                emptyEmbedField,

                {name: 'Balance', value: balanceFieldValue, inline: true},
                emptyEmbedFieldInline,
                {name: 'New Balance', value: newBalance.toLocaleString(), inline: true},
            );
        }

        return embed;
    }

    private drawPlayerCard(): void {
        const card = this.deck.draw();
        if (card) this.playerHand.add(card);
        this.playerHandValue = this.calculateHandValue(this.playerHand);
    }

    private drawDealerCard(): void {
        const card = this.deck.draw();
        if (card) this.dealerHand.add(card);
        this.dealerHandValue = this.calculateHandValue(this.dealerHand);
    }

    private calculateHandValue(hand: Hand): number {
        let sum = 0;
        let numOfAces = 0;
        for (let i = 0; i < hand.cards.length; i++) {
            sum += cardValueMap[hand.cards[i].value];
            if (hand.cards[i].value === 'A') {
                numOfAces++;
            }
        }
        while (sum > 21 && numOfAces > 0) {
            sum -= 10;
            numOfAces--;
        }
        return sum;
    }

    isEnded() {
        return this.ended;
    }

    onFirstTurn() {
        return this.lastAction === undefined;
    }

    splitable() {
        return this.playerHand.cards[0].value === this.playerHand.cards[1].value;
    }

    static get idleTimeout() {
        return BlackjackGame._idleTimeout;
    }
}

export default BlackjackGame;
export { maxWager, maxDecks, PlayerOption, PlayerOptions, blackjackEmitter };