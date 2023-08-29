import { Collection } from 'discord.js';
import { updateCringePoints } from './sql/tables/cringe-points';

class Cooldown {
    private timestamps = new Collection<string, number>();
    private duration;

    constructor(duration: number) {
        this.duration = duration;
    }

    setCooldown(userId: string): void {
        this.timestamps.set(userId, Date.now() + this.duration);
        setTimeout(() => this.timestamps.delete(userId), this.duration);
    }
    
    onCooldown(userId: string): boolean {
        const timestamp = this.timestamps.get(userId);
        if (timestamp) return Date.now() < timestamp;
        return false;
    }
}

class RewardCooldown extends Cooldown {
    private points: number;

    constructor(duration: number, points: number) {
        super(duration);
        this.points = points;
    }

    async reward(userId: string) {
        if (this.onCooldown(userId)) return;
        this.setCooldown(userId);
        await updateCringePoints([{userId, points: this.points}]);
    }
}

export { Cooldown, RewardCooldown };