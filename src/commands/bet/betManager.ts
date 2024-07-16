import { Client, EmbedBuilder, InteractionEditReplyOptions, TextChannel, bold, time, userMention } from 'discord.js';
import { emptyEmbedFieldInline, fetchChannel, fetchMessage } from '../../util/discordUtil';
import { updateCringePoints, CringePointsUpdate } from '../../sql/tables/cringe_points';
import { ProfitType, ProfitsUpdate, updateProfits } from '../../sql/tables/profits';

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
        const channel = await fetchChannel(client, betManager[userId].channelId) as TextChannel;
        const message = await fetchMessage(channel.messages, betManager[userId].interactionId);
        await message.edit({embeds: [betManager[userId].bet.createBetEmbed()], components: []}).catch(console.error);
        delete betManager[userId];
        return true;
    }
    return false;
}

async function endBet(userId: string, client: Client): Promise<boolean> {
    if (betManager[userId]) {
        const channel = await fetchChannel(client, betManager[userId].channelId) as TextChannel;
        const message = await fetchMessage(channel.messages, betManager[userId].interactionId);
        await message.edit({embeds: [betManager[userId].bet.createBetEmbed()], components: []}).catch(console.error);
        betManager[userId].bet.end();
        return true;
    }
    return false;
}

async function resolveBet(userId: string, result: BetResult, client: Client): Promise<InteractionEditReplyOptions> {
    const bet = betManager[userId]?.bet;
    if (bet) {
        bet.resolve();
        if (!bet.isEnded()) {
            await endBet(userId, client);
        }
        if (!bet.isValid()) return {content: `Bet ${bet.getName()} is invalid. You cannot resolve it.`};
        
        const yesBetters = bet.getYesBetters();
        const noBetters = bet.getNoBetters();
        const yesTotal = bet.getYesTotal();
        const noTotal = bet.getNoTotal();
        const yesBettersList = [];
        const noBettersList = [];
        const cringePointUpdates: CringePointsUpdate[] = [];
        const betProfitsUpdates: ProfitsUpdate[] = [];
        
        if (result === BetResult.Yes) {
            for (const [userId, points] of Object.entries(yesBetters).sort(sortBettersDesc)) {
                const winnings = Math.ceil(points / bet.getYesTotal() * bet.getNoTotal());
                yesBettersList.push(`${userMention(userId)}: +${winnings.toLocaleString()}`);
                cringePointUpdates.push({userId, points: winnings});
                betProfitsUpdates.push({userId, type: ProfitType.Bet, profit: winnings});
            }
            for (const [userId, points] of Object.entries(noBetters).sort(sortBettersDesc)) {
                noBettersList.push(`${userMention(userId)}: ${-points.toLocaleString()}`);
                cringePointUpdates.push({userId, points: -points});
                betProfitsUpdates.push({userId, type: ProfitType.Bet, profit: -points});
            }
        }
        else {
            for (const [userId, points] of Object.entries(noBetters).sort(sortBettersDesc)) {
                const winnings = Math.ceil(points / bet.getNoTotal() * bet.getYesTotal());
                noBettersList.push(`${userMention(userId)}: +${winnings.toLocaleString()}`);
                cringePointUpdates.push({userId, points: winnings});
                betProfitsUpdates.push({userId, type: ProfitType.Bet, profit: winnings});
            }
            for (const [userId, points] of Object.entries(yesBetters).sort(sortBettersDesc)) {
                yesBettersList.push(`${userMention(userId)}: ${-points.toLocaleString()}`);
                cringePointUpdates.push({userId, points: -points});
                betProfitsUpdates.push({userId, type: ProfitType.Bet, profit: -points});
            }
        }
        await updateCringePoints(cringePointUpdates);
        void updateProfits(betProfitsUpdates);
        delete betManager[userId];
        
        await Promise.all([...yesBettersList, ...noBettersList]);

        const embed = new EmbedBuilder()
            .setTitle(`${bet.getName()}: ${result} Payout`)
            .addFields(
                { name: 'Total Points Bet', value: `${(yesTotal+noTotal).toLocaleString()}` },
                { name: 'Yes', value: `Total: ${yesTotal.toLocaleString()}\n${yesBettersList.join('\n')}`, inline: true },
                { name: 'No', value: `Total: ${noTotal.toLocaleString()}\n${noBettersList.join('\n')}`, inline: true }
            );
        return {content: `Bet ${bet.getName()} ended with ${result}`, embeds: [embed]};
    }
    return {content: 'You don\'t have an active bet.'};
}

type Betters = {[key: string]: number};

const sortBettersDesc = ([,valueA]: [string, number], [,valueB]: [string, number]) => valueB - valueA;
const mapBetters = ([userId, points]: [string, number])  => `${userMention(userId)}: ${points.toLocaleString()}`;
function createBettersList(betManager: Betters): string {
    return Object.entries(betManager).sort(sortBettersDesc).map(mapBetters).join('\n');
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
        const timeField =  { name: timeFieldName, value: `${time(new Date(this.endTime), 'R')}` };
        const pointTotal = this.yesTotal+this.noTotal;
        const yesPercent = Math.round(this.yesTotal/pointTotal*100);
        const noPercent = Math.round(this.noTotal/pointTotal*100);
        const yesReturn = parseFloat((pointTotal/this.yesTotal).toFixed(2));
        const noReturn = parseFloat((pointTotal/this.noTotal).toFixed(2));
        const yesNumVoters = Object.keys(this.yesBetters).length;
        const noNumVoters = Object.keys(this.noBetters).length;
        const yesBetters = createBettersList(this.yesBetters);
        const noBetters = createBettersList(this.noBetters);
        const embed = new EmbedBuilder()
            .setTitle(`${this.name} ${this.isEnded() && !this.isValid() ? '(INVALID)' : ''}`)
            .addFields(
                timeField,
                { name: 'Yes', value: `${!isNaN(yesPercent) ? yesPercent : 0}%\n${bold('Points')}: ${this.yesTotal.toLocaleString()}\n${bold('Return')}: 1:${!isNaN(yesReturn) ? yesReturn : 1}\n${bold('Voters')}: ${yesNumVoters}`, inline: true },
                emptyEmbedFieldInline,
                { name: 'No', value: `${!isNaN(noPercent) ? noPercent : 0}%\n${bold('Points')}: ${this.noTotal.toLocaleString()}\n${bold('Return')}: 1:${!isNaN(noReturn) ? noReturn : 1}\n${bold('Voters')}: ${noNumVoters}`, inline: true },
                { name: 'Yes Betters', value: `${yesBetters.length ? yesBetters : 'None'}`, inline: true },
                emptyEmbedFieldInline,
                { name: 'No Betters', value: `${noBetters.length ? noBetters : 'None'}`, inline: true }
            );
        return embed;
    }
}

export { createBet, getBet, deleteBet, endBet, resolveBet, BetResult };