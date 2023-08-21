import Card, {suits, values} from './Card';

const deck: Card[] = [];
for (let i = 0; i < suits.length; i++) {
    for (let j = 0; j < values.length; j++) {
        deck.push(new Card(suits[i], values[j]));
    }
}

class Deck {
    cards: Card[] = [];

    constructor(num: number = 1) {
        for (let i = 0; i < num; i++) {
            this.cards.push(...deck.slice());
        }
    }

    draw(): Card|undefined {
        return this.cards.pop();
    }

    shuffle(): void {
        for (let i = this.cards.length - 1; i > 0; i--) { 
            const j = Math.floor(Math.random() * (i + 1)); 
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]]; 
        }
    }

    reset(): void {
        this.cards = deck.slice();
    }

    get length(): number {
        return this.cards.length;
    }
}

export default Deck;