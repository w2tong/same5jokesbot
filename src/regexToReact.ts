import { emotes } from './emotes'

const regexToReact = [
    {
        regex: /cooler/,
        react: () => '🐟'
    },
    {
        regex: /shut.*up/,
        react: () => emotes.smoshShutUp ?? ''
    }
]

export default regexToReact;