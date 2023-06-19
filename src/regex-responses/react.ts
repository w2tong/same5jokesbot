import { GuildEmoji } from 'discord.js';
import { Emotes, emotes } from '../emotes';

const regexToReact = [
    {
        regex: /cooler/,
        getReact: () => '🐟'
    },
    {
        regex: /shut.*up/,
        getReact: () => emotes[Emotes.smoshShutUp] ?? ''
    },
    {
        regex: /^\ba\b$/,
        getReact: () => new Date().getMonth() == 1 ? '🚕' : ''
    },
    {
        regex: /anime|vtuber/,
        getReact: () => emotes[Emotes.DansGame] ?? ''
    }
];

export default (command: string): GuildEmoji | string => {
    for (const regexReact of regexToReact) {
        if (regexReact.regex.test(command)) {
            return regexReact.getReact();
        }
    }
    return '';
};