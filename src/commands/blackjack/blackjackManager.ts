import Card from '../../cards/Card';
import Deck from '../../cards/Deck';

class Blackjack {

    userId: string;
    deck: Deck = new Deck();
    userHand: Card[] = [];
    houseHand: Card[] = [];

    constructor(userId: string) {
        this.userId = userId;
        this.deck.shuffle();
    }

    turn(option: 'hit'|'stand') {
        console.log(option);
    }

}

export default Blackjack;