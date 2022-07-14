const { Client, Intents } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const config = require('./config.json');
const cron = require('cron');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
const player = createAudioPlayer();
let connection;
let timeoutId;

// Object to store emotes
let emotes = {};

// Random integer between 0 and max
function randomRange(max) {
    return Math.floor(Math.random() * max);
}

const verbs = ['Walking', 'Washing', 'Eating'];
const nouns = ['dog', 'dishes', 'dinner'];
function whereIsAndy() {
    const verb = verbs[randomRange(verbs.length)];
    const noun = nouns[randomRange(nouns.length)];
    return verb + ' his ' + noun + '.';
}

const translations = ['Prance forward', 'Shashay left', 'Boogie down', 'Shimmy right'];
function getTranslation() {
    return translations[randomRange(translations.length)];
}

const gamers = ['Rise up!', 'Disperse!', 'Discharge!'];
function gamersResponse() {
    return gamers[randomRange(gamers.length)];
}

function getNextYear() {
    return new Date().getFullYear() + 1;
}

function playAudioFile(message, audioFie) {
    if (message.member.voice.channel) {
        clearTimeout(timeoutId);
        console.log(`[${new Date().toLocaleTimeString('en-US')}] ${message.member.user.username} played ${audioFie}`);
        connection = joinVoiceChannel({
            channelId: message.member.voice.channel.id,
            guildId: message.channel.guild.id,
            adapterCreator: message.channel.guild.voiceAdapterCreator,
        });
        connection.subscribe(player);
        const resource = createAudioResource(`audio/${audioFie}.mp3` );
        player.play(resource);
        return true;
    }
    return false;
}

// Responses to text messages
client.on('messageCreate', function (message) {
    // Don't respond to bots
    if (message.author.bot) return;
    // Don't respond to Bot Abuser role
    if (message.member.roles.cache.some(role => role.name === 'Bot Abuser')) return;
    
    const command = message.content.toLowerCase();
    //React with emoji
    if (/cooler/.test(command)) {
        message.react('🐟');
    }
    let botMessage = '';
    // Replies
    if (/where.*andy/.test(command)) {
        botMessage += whereIsAndy() + '\n';
    }
    if (/translat(e|ion)/.test(command)) {
        botMessage += getTranslation() + '!' + '\n';
    }
    if (/(bazinga|zimbabwe)/.test(command)) {
        botMessage += 'Bazinga!\n';
    }
    if (/(i'?m|me).*hungr?y/.test(command)) {
        botMessage += 'Then go eat.\n';
    }
    if (/oth(er|a).*side/.test(command)) {
        botMessage += 'The other what?\n';
    }
    if (/take?.*it.*bac?k/.test(command)) {
        botMessage += 'Now y\'all.\n';
    }
    if (/no shot/.test(command)) {
        botMessage += 'Shot.\n';
    }
    if (/shot/.test(command) && !/no shot/.test(command)) {
        botMessage += 'No shot.\n';
    }
    if (/fa(x|ct(s|ual))/.test(command)) {
        botMessage += 'No printer.\n';
    }
    if (/pam/.test(command)) {
        botMessage += 'PAM!\n';
    }
    if (/gamers/.test(command)) {
        botMessage += `${gamersResponse()}\n`;
    }
    if (/blind/.test(command)) {
        botMessage += `You mean "${command.replace('blind', '~~blind~~ doing a first playthrough no spoilers')}"`;
    }
    if (/166/.test(command)) {
        botMessage += 'https://media.discordapp.net/attachments/158049091434184705/795546735594045450/unknown.png\n';
    }
    if (/when.*andy.*get(ting)?.*new.*computer/.test(command)) {
        botMessage += `${getNextYear()}\n`;
    }
    if (/too.*late/.test(command)) {
        botMessage += 'But you promised.\n';
    }
    if (/hell\s*halt/.test(command)) {
        botMessage += `I'm a leak, I'm a leak. ${emotes.sadge ? emotes.sadge : ''}\n`;
    }
    
    // Audio
    if (/w(oah|hoa)/.test(command)) {
        botMessage += 'Basement Gang!\n';
        playAudioFile(message, 'basementgang');
    }
    else if (/(thunder|lightning)/.test(command) && !/(thunder vs lightning)/.test(command)) {
        playAudioFile(message, 'thunder_vs_lightning');
    }
    else if (/(thunder vs lightning)/.test(command)) {
        playAudioFile(message, 'thunder_vs_lightning_full');
    }
    else if (/demon/.test(command)) {
        playAudioFile(message, 'demontime');
    }
    else if (/i'?m.*(4|four|poor|bored)/.test(command)) {
        playAudioFile(message, 'VillagerCWhat3');
    }
    else if (/((yo)?u|yu).*(no|know)|sigh/.test(command)) {
        playAudioFile(message, 'sykkuno');
    }
    else if (/uh.*oh/.test(command)) {
        playAudioFile(message, 'uhohstinky');
    }
    else if (/(tbc.*hype|focus.*up)/.test(command)) {
        playAudioFile(message, 'tbchype');
    }
    else if (/suc(c|k|tion)/.test(command)) {
        playAudioFile(message, 'suction');
    }
    else if (/stop/.test(command)) {
        playAudioFile(message, 'itstimetostop');
    }
    else if (/dog/.test(command)) {
        playAudioFile(message, 'whatthedogdoin');
    }
    else if (/bean/.test(command)) {
        playAudioFile(message, 'beans');
    }
    else if (/smosh|shut.*up/.test(command)) {
        playAudioFile(message, 'smosh_shut_up');
    }
    // Send message if there is botMessage
    if (botMessage) {
        message.channel.send(botMessage);
    }
});

// Slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;
    // Play audio
    if (commandName === 'play') {
        const reply = playAudioFile(interaction, interaction.options.getString('audio')) ? `Playing ${interaction.options.getString('audio')}.` : 'You are not in a voice channel.';
        await interaction.reply({ content: reply, ephemeral: true });
    }
    // Reply with a number between 1 and 100 (or min and max)
    else if (commandName === 'roll') {
        const min = (interaction.options.getInteger('min') ? interaction.options.getInteger('min') : 1 );
        const max = (interaction.options.getInteger('max') ? interaction.options.getInteger('max') : 100 );
        await interaction.reply(Math.floor(Math.random()*(max+1-min)+min).toString());
    }
});

// Disconnect after 5 min of inactivity
player.on(AudioPlayerStatus.Idle, () => {
    player.stop();
    timeoutId = setTimeout(() => {
        connection.disconnect();
    }, 300000);
});

// Hourly water and posture check
const waterPostureCheckScheduledMessage = new cron.CronJob('00 00 * * * *', () => {
    const channel = client.channels.cache.get('899162908498468934');
    if (channel) {
        channel.send('<@&899160433548722176> Water Check. Posture Check.');
    }
    else {
        console.log('Water/Posture Check channel not found.');
    }
});
waterPostureCheckScheduledMessage.start();

// Daily Wordle Reminder
const wordleScheduledMessage = new cron.CronJob('00 00 00 * * *', () => {
    const channel = client.channels.cache.get('933772784948101120');
    if (channel) {
        channel.send('Wordle time POGCRAZY');
    }
    else {
        console.log('Wordle channel not found.');
    }
});
wordleScheduledMessage.start();

//TODO: Add user created reminders/cronjobs

client.login(config.BOT_TOKEN);
client.once('ready', () => {
    console.log('Same5JokesBot online.');
    // Add emotes from server to object
    emotes['sadge'] = client.emojis.cache.find(emoji => emoji.name === 'Sadge');
});
