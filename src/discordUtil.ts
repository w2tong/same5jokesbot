import { ChannelManager, MessageManager, UserManager } from 'discord.js';

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

export {emptyEmbedField, fetchChannel, fetchMessage, fetchUser};