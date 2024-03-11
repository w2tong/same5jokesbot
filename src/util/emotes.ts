import { Client, GuildEmoji } from 'discord.js';

const enum Emotes {
    Sadge = 'Sadge',
    smoshShutUp = 'smoshShutUp',
    DansGame = 'DansGame',
    peepoYell = 'peepoYell',
    gerry = 'gerry',
    FeelsDankMan = 'FeelsDankMan',
    gachiGASM = 'gachiGASM',
    Clueless = 'Clueless',
    OkaygeBusiness = 'OkaygeBusiness',
    vacation = 'vacation',
    pawgchamp = 'pawgchamp',
    weirdchamping = 'weirdchamping',
    borpaSpin = 'borpaSpin',
    gachiBASS = 'gachiBASS',
    ChugU = 'ChugU',
    NOOO = 'NOOO',
    OMEGALAUGHING = 'OMEGALAUGHING',
    THIS = 'THIS',
    DESKCHAN = 'DESKCHAN',
    POGCRAZY = 'POGCRAZY'
}

const emotes: {[key: string]: GuildEmoji|string} = {
    [Emotes.Sadge]: ''
};

const getEmotes = (client: Client) => {
    emotes[Emotes.Sadge] = client.emojis.cache.find((emoji: GuildEmoji) => emoji.name === Emotes.Sadge) ?? '';
    emotes[Emotes.smoshShutUp] = client.emojis.cache.find((emoji: GuildEmoji) => emoji.name === Emotes.smoshShutUp) ?? '';
    emotes[Emotes.DansGame] = client.emojis.cache.find((emoji: GuildEmoji) => emoji.name === Emotes.DansGame) ?? '';
    emotes[Emotes.peepoYell] = client.emojis.cache.find((emoji: GuildEmoji) => emoji.name === Emotes.peepoYell) ?? '';
    emotes[Emotes.gerry] = client.emojis.cache.find((emoji: GuildEmoji) => emoji.name === Emotes.gerry) ?? '';
    emotes[Emotes.FeelsDankMan] = client.emojis.cache.find((emoji: GuildEmoji) => emoji.name === Emotes.FeelsDankMan) ?? '';
    emotes[Emotes.gachiGASM] = client.emojis.cache.find((emoji: GuildEmoji) => emoji.name === Emotes.gachiGASM) ?? '';
    emotes[Emotes.Clueless] = client.emojis.cache.find((emoji: GuildEmoji) => emoji.name === Emotes.Clueless) ?? '';
    emotes[Emotes.OkaygeBusiness] = client.emojis.cache.find((emoji: GuildEmoji) => emoji.name === Emotes.OkaygeBusiness) ?? '';
    emotes[Emotes.vacation] = client.emojis.cache.find((emoji: GuildEmoji) => emoji.name === Emotes.vacation) ?? '';
    emotes[Emotes.pawgchamp] = client.emojis.cache.find((emoji: GuildEmoji) => emoji.name === Emotes.pawgchamp) ?? '';
    emotes[Emotes.weirdchamping] = client.emojis.cache.find((emoji: GuildEmoji) => emoji.name === Emotes.weirdchamping) ?? '';
    emotes[Emotes.borpaSpin] = client.emojis.cache.find((emoji: GuildEmoji) => emoji.name === Emotes.borpaSpin) ?? '';
    emotes[Emotes.gachiBASS] = client.emojis.cache.find((emoji: GuildEmoji) => emoji.name === Emotes.gachiBASS) ?? '';
    emotes[Emotes.ChugU] = client.emojis.cache.find((emoji: GuildEmoji) => emoji.name === Emotes.ChugU) ?? '';
    emotes[Emotes.NOOO] = client.emojis.cache.find((emoji: GuildEmoji) => emoji.name === Emotes.NOOO) ?? '';
    emotes[Emotes.OMEGALAUGHING] = client.emojis.cache.find((emoji: GuildEmoji) => emoji.name === Emotes.OMEGALAUGHING) ?? '';
    emotes[Emotes.THIS] = client.emojis.cache.find((emoji: GuildEmoji) => emoji.name === Emotes.THIS) ?? '';
    emotes[Emotes.DESKCHAN] = client.emojis.cache.find((emoji: GuildEmoji) => emoji.name === Emotes.DESKCHAN) ?? '';
    emotes[Emotes.POGCRAZY] = client.emojis.cache.find((emoji: GuildEmoji) => emoji.name === Emotes.POGCRAZY) ?? '';
};

export { Emotes, emotes, getEmotes };
