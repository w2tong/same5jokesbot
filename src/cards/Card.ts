const suits = ['diamonds', 'clubs', 'hearts', 'spades'] as const;
const values = ['1','2','3','4','5','6','7','8','9','10','J','Q','K'] as const;

type Suit = typeof suits[number];
type Value = typeof values[number]

class Card {
    private _suit: Suit;
    private _value: Value;

    constructor(suit: Suit, value: Value) {
        this._suit = suit;
        this._value = value;
    }

    get suit() {
        return this._suit;
    }
    get value() {
        return this._value;
    }
}

export default Card;
export {suits, values};