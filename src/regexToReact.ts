import { emotes } from './emotes';

const regexToReact = [
    {
        regex: /cooler/,
        getReact: () => '🐟'
    },
    {
        regex: /shut.*up/,
        getReact: () => emotes.smoshShutUp ?? ''
    },
    {
        regex: /^\ba\b$/,
        getReact: () => new Date().getMonth() == 1 ? '🚕' : ''
    }
]

export default regexToReact;
