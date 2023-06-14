import { EmbedBuilder, UserManager } from 'discord.js';
import { fetchUser } from './util';

const bets: {[key: string]: Bet} = {};

function createBet(name: string, userId: string, unixTimestamp: number): Bet|null {
    if (bets[userId]) return null;
    bets[userId] = new Bet(name, userId, unixTimestamp);
    return bets[userId];
}

type Betters = {[key: string]: number};

const sortBetters = ([,valueA]: [string, number], [,valueB]: [string, number]) => valueB - valueA;
async function createBettersList(bets: Betters, users: UserManager): Promise<string> {
    const mapBetters = async ([key, value]: [string, number])  => `${(await fetchUser(users, key))}: ${value}`;
    return (await Promise.all(Object.entries(bets).sort(sortBetters).map(mapBetters))).join('\n');
}

class Bet {
    private name: string;
    private creatorUserId: string;
    private unixTimestamp: number;
    private yesBetters: Betters = {};
    private noBetters: Betters = {};
    private yesTotal = 0;
    private noTotal = 0;

    constructor(name: string, userId: string, unixTimestamp: number) {
        this.name = name;
        this.creatorUserId = userId;
        this.unixTimestamp = unixTimestamp;
    }

    isYesBetter(userId: string): boolean {
        return this.yesBetters[userId] ? true : false;
    }

    isNoBetter(userId: string): boolean {
        return this.noBetters[userId] ? true : false;
    }

    addYesBetter(userId: string, points: number): void {
        if (this.yesBetters[userId]) this.yesBetters[userId] += points;
        else this.yesBetters[userId] = points;
        this.yesTotal += points;
    }

    addNoBetter(userId: string, points: number): void {
        if (this.noBetters[userId]) this.yesBetters[userId] += points;
        else this.noBetters[userId] = points;
        this.noTotal += points;
    }

    createBetEmbed(): EmbedBuilder {
        const embed = new EmbedBuilder()
            .setTitle(`${this.name}`)
            .addFields(
                { name: 'Bet ending', value: `<t:${this.unixTimestamp}:R>` },
                { name: 'Yes', value: `Points: ${this.yesTotal}\nReturn: 1:${(this.yesTotal+this.noTotal)/this.yesTotal}\nVoters: ${Object.keys(this.yesBetters).length}`, inline: true },
                { name: 'No', value: `Points: ${this.noTotal}\nReturn: 1:${(this.yesTotal+this.noTotal)/this.noTotal}\nVoters: ${Object.keys(this.noBetters).length}`, inline: true }
            );
        return embed;
    }

    async createBettersEmbed(users: UserManager): Promise<EmbedBuilder> {
        const yesBetters = await createBettersList(this.yesBetters, users);
        const noBetters = await createBettersList(this.noBetters, users);
        const embed = new EmbedBuilder()
            .setTitle(`${this.name}`)
            .addFields(
                { name: 'Total Points Bet', value: `${this.yesTotal+this.noTotal}` },
                { name: 'Yes', value: `Total: **${this.yesTotal}**\n${yesBetters}`, inline: true },
                { name: 'No', value: `Total: **${this.noTotal}**\n${noBetters}`, inline: true }
            );
        return embed;
    }
}

export { createBet };