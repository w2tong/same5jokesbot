import { Client, EmbedBuilder, InteractionEditReplyOptions, TextChannel, UserManager } from 'discord.js';
import { fetchChannel, fetchMessage, fetchUser } from './discordUtil';
import { convertDateToUnixTimestamp } from './util';
import { updateCringePoints, CringePointsUpdate } from './sql/cringe-points';

const enum BetResult {
    Yes = 'YES',
    No = 'NO'
}
const betManager: {[key: string]: {bet: Bet, channelId: string, interactionId: string}} = {};

function createBet(name: string, userId: string, endTime: number, channelId: string, interactionId: string): Bet|null {
    if (betManager[userId]) return null;
    betManager[userId] = {
        bet: new Bet(name, userId, endTime),
        channelId,
        interactionId
    };
    return betManager[userId].bet;
}

function getBet(userId: string): Bet|null {
    return betManager[userId]?.bet ?? null;
}

async function deleteBet(userId: string, client: Client): Promise<boolean> {
    if (betManager[userId]) {
        betManager[userId].bet.delete();
        const channel = await fetchChannel(client.channels, betManager[userId].channelId) as TextChannel;
        const message = await fetchMessage(channel.messages, betManager[userId].interactionId);
        await message.edit({embeds: [betManager[userId].bet.createBetEmbed()], components: []});
        delete betManager[userId];
        return true;
    }
    return false;
}

async function endBet(userId: string, client: Client): Promise<boolean> {
    if (betManager[userId]) {
        const channel = await fetchChannel(client.channels, betManager[userId].channelId) as TextChannel;
        const message = await fetchMessage(channel.messages, betManager[userId].interactionId);
        await message.edit({embeds: [betManager[userId].bet.createBetEmbed()], components: []});
        if (!betManager[userId].bet.isResolved()) {
            await message.reply({embeds: [await betManager[userId].bet.createBettersEmbed(client.users)]});
        }
        betManager[userId].bet.end();
        return true;
    }
    return false;
}

async function resolveBet(userId: string, result: string, client: Client): Promise<InteractionEditReplyOptions> {
    const bet = betManager[userId]?.bet;
    if (bet) {
        bet.resolve();
        if (!bet.isEnded()) {
            await endBet(userId, client);
        }
        if (!bet.isValid()) return {content: `Bet ${bet.getName()} is invalid. You cannot resolve it.`};
        const updates: Array<CringePointsUpdate> = [];
        const yesTotal = bet.getYesTotal();
        const noTotal = bet.getNoTotal();
        const yesBetters = Object.entries(bet.getYesBetters());
        const noBetters = Object.entries(bet.getNoBetters());
        const yesBettersList = [];
        const noBettersList = [];
        
        if (result === BetResult.Yes) {
            for (const [userId, points] of yesBetters.sort(sortBettersDesc)) {
                const pointUpdate = Math.ceil(points / bet.getYesTotal() * bet.getNoTotal());
                updates.push({userId, points: pointUpdate});
                yesBettersList.push(`${await fetchUser(client.users, userId)}: +${pointUpdate}`);
            }
            for (const [userId, points] of noBetters.sort(sortBettersDesc)) {
                updates.push({userId, points: -points});
                noBettersList.push(`${await fetchUser(client.users, userId)}: ${-points}`);
            }
        }
        else {
            for (const [userId, points] of noBetters.sort(sortBettersDesc)) {
                const pointUpdate = Math.ceil(points / bet.getNoTotal() * bet.getYesTotal());
                updates.push({userId, points: pointUpdate});
                noBettersList.push(`${await fetchUser(client.users, userId)}: +${pointUpdate}`);
            }
            for (const [userId, points] of yesBetters.sort(sortBettersDesc)) {
                updates.push({userId, points: -points});
                yesBettersList.push(`${await fetchUser(client.users, userId)}: ${-points}`);
            }
        }
        void updateCringePoints(updates);
        delete betManager[userId];
        
        await Promise.all([...yesBettersList, ...noBettersList]);

        const embed = new EmbedBuilder()
            .setTitle(`${bet.getName()}: ${result} Payout`)
            .addFields(
                { name: 'Total Points Bet', value: `${yesTotal+noTotal}` },
                { name: 'Yes', value: `Total: ${yesTotal}\n${yesBettersList.join('\n')}`, inline: true },
                { name: 'No', value: `Total: ${noTotal}\n${noBettersList.join('\n')}`, inline: true }
            );
        return {content: `Bet ${bet.getName()} ended with ${result}`, embeds: [embed]};
    }
    return {content: 'You don\'t have an active bet.'};
}

type Betters = {[key: string]: number};

const sortBettersDesc = ([,valueA]: [string, number], [,valueB]: [string, number]) => valueB - valueA;
async function createBettersList(betManager: Betters, users: UserManager): Promise<string> {
    const mapBetters = async ([key, value]: [string, number])  => `${(await fetchUser(users, key))}: ${value}`;
    return (await Promise.all(Object.entries(betManager).sort(sortBettersDesc).map(mapBetters))).join('\n');
}

class Bet {
    private name: string;
    private creatorUserId: string;
    private endTime: number;
    private yesBetters: Betters = {};
    private noBetters: Betters = {};
    private yesTotal = 0;
    private noTotal = 0;
    private deleted = false;
    private resolved = false;

    constructor(name: string, userId: string, endTime: number) {
        this.name = name;
        this.creatorUserId = userId;
        this.endTime = endTime;
    }

    getName(): string {
        return this.name;
    }

    isDeleted(): boolean {
        return this.deleted;
    }

    delete(): void {
        this.end();
        this.deleted = true;
    }

    isEnded() {
        return new Date().getTime() >= this.endTime;
    }

    end() {
        if (!this.isEnded()) {
            this.endTime = new Date().getTime();
        }
    }

    isResolved() {
        return this.resolved;
    }

    resolve() {
        this.resolved = true;
    }

    isValid() {
        return this.yesTotal !== 0 && this.noTotal !== 0;
    }

    isYesBetter(userId: string): boolean {
        return this.yesBetters[userId] ? true : false;
    }

    isNoBetter(userId: string): boolean {
        return this.noBetters[userId] ? true : false;
    }

    getYesBetters() {
        return this.yesBetters;
    }

    getNoBetters() {
        return this.noBetters;
    }

    getYesTotal() {
        return this.yesTotal;
    }

    getNoTotal() {
        return this.noTotal;
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

    getUserPointsBet(userId: string): number {
        if (this.yesBetters[userId]) return this.yesBetters[userId];
        if (this.noBetters[userId]) return this.noBetters[userId];
        return 0;
    }

    createBetEmbed(): EmbedBuilder {
        const timeFieldName = this.deleted ?  'Bet deleted' : `Bet end${this.isEnded() ? 'ed' : 'ing'}`;
        const timeField =  { name: timeFieldName, value: `<t:${convertDateToUnixTimestamp(new Date(this.endTime))}:R>` };
        const pointTotal = this.yesTotal+this.noTotal;
        const embed = new EmbedBuilder()
            .setTitle(`${this.name} ${this.isEnded() && !this.isValid() ? '(INVALID)' : ''}`)
            .addFields(
                timeField,
                { name: 'Yes', value: `${Math.round(this.yesTotal/pointTotal*100)}%\nPoints: ${this.yesTotal}\nReturn: 1:${parseFloat((pointTotal/this.yesTotal).toFixed(2))}\nVoters: ${Object.keys(this.yesBetters).length}`, inline: true },
                { name: 'No', value: `${Math.round(this.noTotal/pointTotal*100)}%\nPoints: ${this.noTotal}\nReturn: 1:${parseFloat((pointTotal/this.noTotal).toFixed(2))}\nVoters: ${Object.keys(this.noBetters).length}`, inline: true }
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

export { createBet, getBet, deleteBet, endBet, resolveBet, BetResult };