import { userMention } from 'discord.js';
import Character, { CharacterStats } from './Character';

class PlayerCharacter extends Character {
    private userId: string|null = null;

    constructor(stats: CharacterStats, name: string, index: number, userId: string) {
        super(stats, name, index);
        this.userId = userId;
    }

    getCharString() {
        return `
        ${this.name}${this.userId ? ` (${userMention(this.userId)})` : ''}
        Health: ${this.getHealthString()}
        Mana: ${this.getManaString()}
        `;
    }
}

export default PlayerCharacter;