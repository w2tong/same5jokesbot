import { ChannelManager, EmbedBuilder, InteractionEditReplyOptions, MessageManager, User, UserManager, userMention } from 'discord.js';
import { ProfitType, getTopProfits, getTotalProfits, getUserProfits } from '../sql/tables/profits';
import { capitalize } from './util';

const messageEmbedLimit = 10;
const emptyEmbedField = {name: '\u200b', value: '\u200b', inline: true};
const monthChoices = [
    {name: '1. January', value: '1'},
    {name: '2. February', value: '2'},
    {name: '3. March', value: '3'},
    {name: '4. April', value: '4'},
    {name: '5. May', value: '5'},
    {name: '6. June', value: '6'},
    {name: '7. July', value: '7'},
    {name: '8. August', value: '8'},
    {name: '9. Septemper', value: '9'},
    {name: '10. October', value: '10'},
    {name: '11. November', value: '11'},
    {name: '12. December', value: '12'}
];

async function fetchChannel(channels: ChannelManager, channelId: string) {
    return channels.cache.get(channelId) ?? await channels.fetch(channelId);
}

async function fetchMessage(messages: MessageManager, messageId: string) {
    return messages.cache.get(messageId) ?? await messages.fetch(messageId);
}

async function fetchUser(users: UserManager, userId: string) {
    return users.cache.get(userId) ?? await users.fetch(userId);
}

async function createUserNumberedList(users: Array<Promise<User>>) {
    return (await Promise.all(users)).map((user, i) => `${i+1} . ${user}`).join('\n');
}

function createDispersersList(usersIdsStr: string) {
    const userIds = usersIdsStr.split(',');
    const userIdCount: { [key: string]: number } = {};
    for (const userId of userIds) {
        userIdCount[userId] = userIdCount[userId]+1 || 1;
    }
    return Object.keys(userIdCount).map(userId => `${userMention(userId)} ${userIdCount[userId] > 1 ? '('+userIdCount[userId].toString()+')': ''}`).join('\n');
}

function createUserProfitsEmbed(username: string, winnings: number, losses: number, profits: number, type?: ProfitType) {
    return new EmbedBuilder()
        .setTitle(`${username}'s ${type ? `${capitalize(type)} ` : ''}Profits`)
        .addFields(
            {name: 'Winnings', value: `${winnings.toLocaleString()}`, inline: true},
            {name: 'Losses', value: `${losses.toLocaleString()}`, inline: true},
            {name: 'Profits', value: `${profits.toLocaleString()}`, inline: true}
        );
}

async function generateUserProfitsResponse(userId: string, username: string, type?: ProfitType): Promise<InteractionEditReplyOptions> {
    const profits = await (type ? getUserProfits(userId, type) : getUserProfits(userId));
    if (!profits) return {content: `You do not have profits${type ? ` for ${capitalize(type)}` : ''}.`};
    if (!type) return {embeds: [createUserProfitsEmbed(username, profits.WINNINGS, profits.LOSSES, profits.PROFITS)]};
    return {embeds: [createUserProfitsEmbed(username, profits.WINNINGS, profits.LOSSES, profits.PROFITS, type)]};
}

function createTopProfitsEmbed(totalWinnings: number, totalLosses: number, totalProfits: number, users: string[], userProfits: string[], type?: ProfitType) {
    return new EmbedBuilder()
        .setTitle(`${type ? capitalize(type) : 'Total'} Profits`)
        .addFields(
            {name: 'Total Winnings', value: `${totalWinnings.toLocaleString()}`, inline: true},
            {name: 'Total Losses', value: `${totalLosses.toLocaleString()}`, inline: true},
            {name: 'Total Profits', value: `${totalProfits.toLocaleString()}`, inline: true},
            {name: 'Users', value: users.join('\n'), inline: true},
            emptyEmbedField,
            {name: 'Profits', value: userProfits.join('\n'), inline: true}
        );
}

async function generateTopProfitsEmbed(type?: ProfitType): Promise<InteractionEditReplyOptions> {
    const topProfits = await (type ? getTopProfits(type) : getTopProfits());
    const totalProfits = await (type ? getTotalProfits(type) : getTotalProfits());
    if (topProfits.length === 0 || !totalProfits) return {content: `There are no profits${type ? ` for ${capitalize(type)}` : ''}.`};
    const users: string[] = [];
    const userProfits: string[] = [];
    for (const {USER_ID, PROFITS} of topProfits) {
        users.push(userMention(USER_ID));
        userProfits.push(PROFITS.toLocaleString());
    }
    if (!type) createTopProfitsEmbed(totalProfits.WINNINGS, totalProfits.LOSSES, totalProfits.PROFITS, users, userProfits);
    return {embeds: [createTopProfitsEmbed(totalProfits.WINNINGS, totalProfits.LOSSES, totalProfits.PROFITS, users, userProfits, type)]};
}

export {messageEmbedLimit, emptyEmbedField, monthChoices, fetchChannel, fetchMessage, fetchUser, createUserNumberedList, createDispersersList, generateUserProfitsResponse, generateTopProfitsEmbed};