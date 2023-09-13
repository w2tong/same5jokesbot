import { userMention } from 'discord.js';
import Character, { CharacterStats } from './Character';

class PlayerCharacter extends Character {
    private userId: string;

    constructor(stats: CharacterStats, name: string, index: number, userId: string) {
        super(stats, name, index);
        this.userId = userId;
    }

    getName() {
        return `${this.name} (${userMention(this.userId)})`;
    }
}

export default PlayerCharacter;