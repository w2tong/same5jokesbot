const suits = ['D', 'C', 'H', 'S'] as const;
const values = ['1','2','3','4','5','6','7','8','9','10','J','Q','K'] as const;

type Suit = typeof suits[number];
type Value = typeof values[number]

const suitSymbol: {[key in Suit]: string} = {
    'D': '♦',
    'C': '♣',
    'H': '♥',
    'S': '♠'
};

class Card {
    private _suit: Suit;
    private _value: Value;
    private _symbol: string;

    constructor(suit: Suit, value: Value) {
        this._suit = suit;
        this._value = value;
        this._symbol = suitSymbol[suit];
    }

    get suit(): Suit {
        return this._suit;
    }
    get value(): Value {
        return this._value;
    }
    get symbol(): string {
        return this._symbol;
    }

    toString(): string {
        return `${this._symbol}${this._value}`;
    }
}

export default Card;
export {suits, values, Suit, Value};