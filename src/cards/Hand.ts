import Card from './Card';

class Hand {
    cards: Card[] = [];

    add(card: Card): void {
        this.cards.push(card);
    }

    toString(): string {
        return this.cards.map(card => card.toString()).join('\t');
    }

    get length() {
        return this.cards.length;
    }
}

export default Hand;