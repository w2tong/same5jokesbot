import { Client, GuildEmoji } from 'discord.js';

// Object to store emotes
// type Emotes = 'sadge'|'smoshShutUp'|'dansGame'|'peepoYell'|'gerry'|'FeelsDankMan'|'gachiGASM'|'Clueless'|'OkaygeBusiness'|'vacation';
// type EmotesMap<T> = { [Emote in Emotes]: T };
// const emotes: EmotesMap<string|GuildEmoji> = {
const emotes: {[key: string]: GuildEmoji|string} = {
    sadge: '',
    smoshShutUp: '',
    dansGame: '',
    peepoYell: '',
    gerry: '',
    FeelsDankMan: '',
    gachiGASM: '',
    Clueless: '',
    OkaygeBusiness: '',
    vacation: ''
};

const getEmotes = (client: Client) => {
    emotes['sadge'] = client.emojis.cache.find((emoji: GuildEmoji) => emoji.name === 'Sadge') ?? '';
    emotes['smoshShutUp'] = client.emojis.cache.find((emoji: GuildEmoji) => emoji.name === 'smoshShutUp') ?? '';
    emotes['dansGame'] = client.emojis.cache.find((emoji: GuildEmoji) => emoji.name === 'DansGame') ?? '';
    emotes['peepoYell'] = client.emojis.cache.find((emoji: GuildEmoji) => emoji.name === 'peepoYell') ?? '';
    emotes['gerry'] = client.emojis.cache.find((emoji: GuildEmoji) => emoji.name === 'gerry') ?? '';
    emotes['FeelsDankMan'] = client.emojis.cache.find((emoji: GuildEmoji) => emoji.name === 'FeelsDankMan') ?? '';
    emotes['gachiGASM'] = client.emojis.cache.find((emoji: GuildEmoji) => emoji.name === 'gachiGASM') ?? '';
    emotes['Clueless'] = client.emojis.cache.find((emoji: GuildEmoji) => emoji.name === 'Clueless') ?? '';
    emotes['OkaygeBusiness'] = client.emojis.cache.find((emoji: GuildEmoji) => emoji.name === 'OkaygeBusiness') ?? '';
    emotes['vacation'] = client.emojis.cache.find((emoji: GuildEmoji) => emoji.name === 'vacation') ?? '';
};

export { emotes, getEmotes };
