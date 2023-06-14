import { EmbedBuilder, UserManager } from 'discord.js';
import { fetchUser } from './util';

class Bet {
    private name: string;
    private creatorUserId: string;
    private unixTimestamp: number;
    private yesBets: {[key: string]: number} = {};
    private noBets: {[key: string]: number} = {};
    private yesTotal = 0;
    private noTotal = 0;

    constructor(name: string, userId: string, unixTimestamp: number) {
        this.name = name;
        this.creatorUserId = userId;
        this.unixTimestamp = unixTimestamp;
    }

    isYesBetter(userId: string): boolean {
        return this.yesBets[userId] ? true : false;
    }

    isNoBetter(userId: string): boolean {
        return this.noBets[userId] ? true : false;
    }

    addYesBetter(userId: string, points: number): void {
        if (this.yesBets[userId]) this.yesBets[userId] += points;
        else this.yesBets[userId] = points;
        this.yesTotal += points;
    }

    addNoBetter(userId: string, points: number): void {
        if (this.noBets[userId]) this.yesBets[userId] += points;
        else this.noBets[userId] = points;
        this.noTotal += points;
    }

    createBetEmbed(): EmbedBuilder {
        const embed = new EmbedBuilder()
            .setTitle(`${this.name}`)
            .addFields(
                { name: 'Bet ending', value: `<t:${this.unixTimestamp}:R>` },
                { name: 'Yes', value: `Points: ${this.yesTotal}\nReturn: 1:${(this.yesTotal+this.noTotal)/this.yesTotal}\nVoters: ${Object.keys(this.yesBets).length}`, inline: true },
                { name: 'No', value: `Points: ${this.noTotal}\nReturn: 1:${(this.yesTotal+this.noTotal)/this.noTotal}\nVoters: ${Object.keys(this.noBets).length}`, inline: true }
            );
        return embed;
    }

    async createBettersEmbed(users: UserManager): Promise<EmbedBuilder> {
        const yesBetters = (await Promise.all(Object.entries(this.yesBets).map(async ([key, value]) => `${(await fetchUser(users, key)).username}: ${value}`))).join('\n');
        const noBetters = (await Promise.all(Object.entries(this.noBets).map(async ([key, value]) => `${(await fetchUser(users, key)).username}: ${value}`))).join('\n');
        const embed = new EmbedBuilder()
            .setTitle(`${this.name}`)
            .addFields(
                { name: 'Points Bet', value: `${this.yesTotal+this.noTotal}` },
                { name: 'Yes', value: `Total: **${this.yesTotal}**\n${yesBetters}`, inline: true },
                { name: 'No', value: `Total: **${this.noTotal}**\n${noBetters}`, inline: true }
            );
        return embed;
    }
}

export { Bet };