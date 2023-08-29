import { logError } from '../logger';

const regexToImage = [
    {
        regex: /\b166\b/,
        getImage: () => 'https://media.discordapp.net/attachments/158049091434184705/795546735594045450/unknown.png'
    },
    {
        regex: /judge?ment/,
        getImage: () => 'https://media.discordapp.net/attachments/837434910486691873/1008836841581072454/judgment.png'
    },
    {
        regex: /\bmc\b|minecraft|chernobyl/,
        getImage: () => 'https://cdn.discordapp.com/attachments/982195734046732338/1078118698222628915/mc_chernobyl.png'
    }
];

export default (command: string): string[] => {
    const images: string[] = [];
    for (const regexImage of regexToImage) {
        if (regexImage.regex.test(command)) {
            try {
                images.push(regexImage.getImage());
            } catch(err) {
                logError(err);
            }
        }
    }
    return images;
};