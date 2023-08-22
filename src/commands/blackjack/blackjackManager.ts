import { EmbedBuilder, userMention } from 'discord.js';
import { Value } from '../../cards/Card';
import Deck from '../../cards/Deck';
import Hand from '../../cards/Hand';
import { emptyEmbedField, emptyEmbedFieldInline } from '../../util/discordUtil';
import { updateCringePoints } from '../../sql/tables/cringe-points';

const maxWager = 1_000_000;
const maxDecks = 100;
const payoutRate = 1.5;

const PlayerOptions = {
    Hit: 'Hit',
    Stand: 'Stand',
    Double: 'Double'
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

    constructor(userId: string, username: string, numOfDecks: number, wager: number, balance: number) {
        this.userId = userId;
        this.username = username;
        this.wager = wager;
        this.deck = new Deck(numOfDecks);
        this.numOfDecks = numOfDecks;
        this.balance = balance;
        this.playerHand = new Hand(userId);
    }

    async startGame() {
        await updateCringePoints([{userId: this.userId, points: -this.wager}]);
        if (process.env.CLIENT_ID) await updateCringePoints([{userId: process.env.CLIENT_ID, points: this.wager}]);
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
            await this.endGame(EndGameResults.Win);
        }
        else if (this.dealerHandValue === 21) {
            await this.endGame(EndGameResults.Lose);
        }
    }

    async endGame(result: EndGameResult) {
        if (result === EndGameResults.Win) {
            await updateCringePoints([{userId: this.userId, points: this.wager + this.wager * payoutRate}]);
            if (process.env.CLIENT_ID) await updateCringePoints([{userId: process.env.CLIENT_ID, points: -(this.wager + this.wager * payoutRate)}]);
        }
        else if (result === EndGameResults.Tie) {
            await updateCringePoints([{userId: this.userId, points: this.wager}]);
            if (process.env.CLIENT_ID) await updateCringePoints([{userId: process.env.CLIENT_ID, points: -this.wager}]);
        }
        else if (result === EndGameResults.Lose) {
            // do nothing
        }
        this.result = result;
        this.ended = true;
    }

    async input(option: PlayerOption): Promise<{valid: boolean, msg?: string}> {
        this.lastAction = option;
        if (option === PlayerOptions.Hit) {
            this.drawPlayerCard();
            if (this.playerHandValue > 21) {
                await this.endGame(EndGameResults.Lose);
            }
        }
        else {
            if (option === PlayerOptions.Double) {
                if (this.balance <= this.wager * 2) {
                    return {valid: false, msg: `You do not have enough points to Double Down (Balance: ${this.balance.toLocaleString()}).`};
                }
                await updateCringePoints([{userId: this.userId, points: -this.wager}]);
                if (process.env.CLIENT_ID) await updateCringePoints([{userId: process.env.CLIENT_ID, points: this.wager}]);
                this.wager *= 2;

                this.drawPlayerCard();
                if (this.playerHandValue > 21) {
                    await this.endGame(EndGameResults.Lose);
                }
            }

            // Dealer's Turn
            while (this.dealerHandValue < this.playerHandValue) {
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

        if (this.ended) {
            let balanceFieldValue = this.balance.toLocaleString();
            let newBalance = this.balance;
            if (this.result === EndGameResults.Tie) {
                balanceFieldValue += ' (0)';
            }
            else {
                if (this.result === EndGameResults.Win) {
                    balanceFieldValue += ` (+${(this.wager * payoutRate).toLocaleString()})`;
                    newBalance += this.wager * payoutRate;
                }
                else if (this.result === EndGameResults.Lose) {
                    balanceFieldValue += ` (-${this.wager.toLocaleString()})`;
                    newBalance -= this.wager;
                }
            }
            embed.addFields(
                emptyEmbedField,

                {name: 'Balance', value: balanceFieldValue, inline: true},
                {name: 'New Balance', value: newBalance.toLocaleString(), inline: true},
                {name: 'Payout Rate', value: `${payoutRate * 100}%`, inline: true}
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
}

export default BlackjackGame;
export { maxWager, maxDecks, PlayerOption, PlayerOptions };