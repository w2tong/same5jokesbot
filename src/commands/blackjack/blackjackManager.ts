import { EmbedBuilder } from 'discord.js';
import { Value } from '../../cards/Card';
import Deck from '../../cards/Deck';
import Hand from '../../cards/Hand';
import { emptyEmbedField } from '../../util/discordUtil';

type playerOption = 'hit'|'stand'|'double';
const cardValueMap: {[key in Value]: number} = {
    '1': 1 | 11,
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
    private wager: number;
    private deck: Deck = new Deck();
    private playerHand: Hand;
    private dealerHand: Hand = new Hand(process.env.CLIENT_ID ?? '0');

    constructor(userId: string, username: string, wager: number) {
        this.userId = userId;
        this.username = username;
        this.wager = wager;
        this.playerHand = new Hand(userId);
        this.deck.shuffle();
        // Draw starting cards
        this.drawPlayerCard();
        this.drawDealerCard();
        this.drawPlayerCard();
        this.drawDealerCard();
    }

    playerTurn(option: playerOption) {
        console.log(option);
    }

    createEmbed(): EmbedBuilder {
        return new EmbedBuilder()
            .setTitle(`${this.username}'s Blackjack Game`)
            .addFields(
                {name: 'Dealer', value: `${this.dealerHand}`, inline: true},
                emptyEmbedField,
                {name: 'Dealer Value', value: `${this.calculateHandValue(this.dealerHand)}`, inline: true},

                {name: 'Player', value: `${this.playerHand}`, inline: true},
                emptyEmbedField,
                {name: 'Player Value', value: `${this.calculateHandValue(this.playerHand)}`, inline: true},
            );
    }

    private drawPlayerCard(): void {
        const card = this.deck.draw();
        if (card) this.playerHand.add(card);
    }

    private drawDealerCard(): void {
        const card = this.deck.draw();
        if (card) this.dealerHand.add(card);
    }

    private calculateHandValue(hand: Hand): number {
        let sum = 0;
        for (let i = 0; i < hand.cards.length; i++) {
            sum += cardValueMap[hand.cards[i].value];
        }
        return sum;
    }
}

export default BlackjackGame;