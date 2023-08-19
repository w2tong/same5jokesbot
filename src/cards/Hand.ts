import Card from './Card';

class Hand {

    userId: string;
    cards: Card[] = [];

    constructor(userId: string) {
        this.userId = userId;
    }

    add(card: Card): void {
        this.cards.push(card);
    }

    toString(): string {
        return this.cards.map(card => card.toString()).join('\t');
    }
}

export default Hand;