import Card, {suits, values} from './Card';

const deck: Card[] = [];
for (let i = 0; i < suits.length; i++) {
    for (let j = 0; j < values.length; j++) {
        deck.push(new Card(suits[i], values[j]));
    }
}

class Deck {
    cards: Card[];

    constructor() {
        this.cards = deck.slice();
    }

    draw() {
        return this.cards.pop();
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) { 
            const j = Math.floor(Math.random() * (i + 1)); 
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]]; 
        }
    }

    reset() {
        this.cards = deck.slice();
    }
}

export default Deck;