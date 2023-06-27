import { ChannelManager, MessageManager, User, UserManager } from 'discord.js';

const emptyEmbedField = {name: '\u200b', value: '\u200b', inline: true};

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

async function createDispersersList(usersIdsStr: string, userManager: UserManager) {
    const userIds = usersIdsStr.split(',');
    const userIdCount: { [key: string]: number } = {};
    for (const userId of userIds) {
        userIdCount[userId] = userIdCount[userId]+1 || 1;
    }
    const users = [];
    for (const userId of Object.keys(userIdCount)) {
        users.push(await fetchUser(userManager, userId));
    }
    return (await Promise.all(users)).map(user => `${user} ${userIdCount[user.id] > 1 ? '('+userIdCount[user.id].toString()+')': ''}`).join('\n');
}

export {emptyEmbedField, fetchChannel, fetchMessage, fetchUser, createUserNumberedList, createDispersersList};