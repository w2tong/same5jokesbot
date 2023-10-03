import { Client, MessageManager, User, userMention } from 'discord.js';

const MessageEmbedLimit = 10;
const UsersPerEmbed = 25;
const FieldValueCharLimit = 1024;
const SelectMenuOptionLimit = 25;
const emptyEmbedField = {name: '\u200b', value: '\u200b'};
const emptyEmbedFieldInline = {name: '\u200b', value: '\u200b', inline: true};
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

async function fetchChannel(client: Client, channelId: string) {
    return client.channels.cache.get(channelId) ?? await client.channels.fetch(channelId);
}

async function fetchMessage(messages: MessageManager, messageId: string) {
    return messages.cache.get(messageId) ?? await messages.fetch(messageId);
}

async function fetchUser(client: Client, userId: string) {
    return client.users.cache.get(userId) ?? await client.users.fetch(userId);
}

async function createUserNumberedList(users: Promise<User>[]) {
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

function getBalanceStrings(bal: number, profit: number): { balance: string, newBalance: string} {
    return {
        balance: `${bal.toLocaleString()} (${profit > 0 ? '+' : ''}${profit.toLocaleString()})`,
        newBalance: `${(bal + profit).toLocaleString()}`
    };
}

function header(str: string, size: 1|2|3): string {
    return `${'#'.repeat(size)} ${str}`;
}

export {MessageEmbedLimit, UsersPerEmbed, FieldValueCharLimit, SelectMenuOptionLimit, emptyEmbedField, emptyEmbedFieldInline, monthChoices, fetchChannel, fetchMessage, fetchUser, createUserNumberedList, createDispersersList, getBalanceStrings, header};