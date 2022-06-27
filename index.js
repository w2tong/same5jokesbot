const { Client, Intents } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const config = require('./config.json');
const cron = require('cron');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
const player = createAudioPlayer();
let connection;
let timeoutId;

let emotes = {};

const verbs = ['Walking', 'Washing', 'Eating'];
const nouns = ['dog', 'dishes', 'dinner'];
const translations = ['Prance forward', 'Shashay left', 'Boogie down', 'Shimmy right'];
const gamers = ['Rise up!', 'Disperse!', 'Discharge!'];

// Random integer between 0 and max
function randomRange(max) {
    return Math.floor(Math.random() * max);
}

function whereIsAndy() {
    let verb = verbs[randomRange(verbs.length)];
    let noun = nouns[randomRange(nouns.length)];
    return verb + ' his ' + noun + '.';
}

function translate() {
    return translations[randomRange(translations.length)];
}

function gamersResponse() {
    return gamers[randomRange(gamers.length)];
}

function getAndyComputerDate() {
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
        // const subscription = connection.subscribe(player);
        connection.subscribe(player);
        const resource = createAudioResource(`audio/${audioFie}.mp3` );
        player.play(resource);
        return true;
    }
    return false;
}

// Message responses
client.on('messageCreate', function (message) {
    // Don't respond to bots
    if (message.author.bot) return;
    // Don't respond to Bot Abuser role
    if (message.member.roles.cache.some(role => role.name === 'Bot Abuser')) return;
    
    let command = message.content.toLowerCase();
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
        botMessage += translate() + '!' + '\n';
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
    if (/gay?mers/.test(command)) {
        botMessage += gamersResponse() + '\n';
    }
    if (/blind/.test(command)) {
        botMessage += 'You mean "' + command.replace('blind', '~~blind~~ doing a first playthrough no spoilers') + '"';
    }
    if (/166/.test(command)) {
        botMessage += 'https://media.discordapp.net/attachments/158049091434184705/795546735594045450/unknown.png' + '\n';
    }
    if (/when.*andy.*get(ting)?.*new.*computer/.test(command)) {
        botMessage += getAndyComputerDate(); + '\n';
    }
    if (/too.*late/.test(command)) {
        botMessage += 'But you promised.' + '\n';
    }
    if (/hell\s*halt/.test(command)) {
        let sadge = '';
        if (emotes.sadge) sadge = emotes.sadge;
        botMessage += `I'm a leak, I'm a leak. ${sadge}` + '\n';
    }
    // Audio
    if (/w(oah|hoa)/.test(command)) {
        botMessage += 'Basement Gang!' + '\n';
        playAudioFile(message, 'basementgang');
    }
    if (/(thunder|lightning)/.test(command) && !/(thunder vs lightning)/.test(command)) {
        playAudioFile(message, 'thunder_vs_lightning');
    }
    if (/(thunder vs lightning)/.test(command)) {
        playAudioFile(message, 'thunder_vs_lightning_full');
    }
    if (/demon/.test(command)) {
        playAudioFile(message, 'demontime');
    }
    if (/i'?m.*(4|four|poor|bored)/.test(command)) {
        playAudioFile(message, 'VillagerCWhat3');
    }
    if (/((yo)?u|yu).*(no|know)/.test(command)) {
        playAudioFile(message, 'sykkuno');
    }
    if (/uh.*oh/.test(command)) {
        playAudioFile(message, 'uhohstinky');
    }
    if (/(tbc.*hype|focus.*up)/.test(command)) {
        playAudioFile(message, 'tbchype');
    }
    if (/suc(c|k|tion)/.test(command)) {
        playAudioFile(message, 'suction');
    }
    if (/stop/.test(command)) {
        playAudioFile(message, 'itstimetostop');
    }
    if (/dog/.test(command)) {
        playAudioFile(message, 'whatthedogdoin');
    }
    if (/bean/.test(command)) {
        playAudioFile(message, 'beans');
    }
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
        let reply = 'You are not in a voice channel';
        if (playAudioFile(interaction, interaction.options.getString('audio'))) {
            reply = `Playing ${interaction.options.getString('audio')}.`;
        }
        await interaction.reply({ content: reply, ephemeral: true });
    }
    // Reply with a number between 1 and 100
    else if (commandName === 'roll') {
        let int = 100;
        /* CDOE FOR ROLLING 1 TO ENTERED RANGE
        let int = interaction.options.getInteger('int');
        int = (interaction.options.getInteger('int') ? interaction.options.getInteger('int') : 100 )
        */
        await interaction.reply(Math.floor(Math.random() * (int - 1) + 1).toString());
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
let waterPostureCheckScheduledMessage = new cron.CronJob('00 00 * * * *', () => {
    let channel = client.channels.cache.get('899162908498468934');
    if (channel) {
        channel.send('<@&899160433548722176> Water Check. Posture Check.');
    }
    else {
        console.log('Water/Posture Check channel not found.');
    }
});
waterPostureCheckScheduledMessage.start();

// Daily Wordle Reminder
let wordleScheduledMessage = new cron.CronJob('00 00 00 * * *', () => {
    let channel = client.channels.cache.get('933772784948101120');
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
    emotes['sadge'] = client.emojis.cache.find(emoji => emoji.name === 'Sadge');
});