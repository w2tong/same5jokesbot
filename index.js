const { Client, Intents } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const config = require("./config.json");
const cron = require("cron");

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
const player = createAudioPlayer();

let emotes = {};

const verbs = ["Walking", "Washing", "Eating"];
const nouns = ["dog", "dishes", "dinner"];
const translations = ["Prance forward", "Shashay left", "Boogie down", "Shimmy right"];
const gamers = ["Rise up!", "Disperse!", "Discharge!"];

function RandomRange(max) {
    return Math.floor(Math.random() * max);
}

function WhereIsAndy() {
    let verb = verbs[RandomRange(verbs.length)];
    let noun = nouns[RandomRange(nouns.length)];
    return verb + " his " + noun + ".";
}

function Translate() {
    return translations[RandomRange(translations.length)];
}

function gamersResponse() {
    return gamers[RandomRange(gamers.length)];
}

function getAndyComputerDate() {
    return new Date().getFullYear() + 1;
}

function playAudioFile(message, audioFie) {
    if (message.member.voice.channel) {
        const connection = joinVoiceChannel({
            channelId: message.member.voice.channel.id,
            guildId: message.channel.guild.id,
            adapterCreator: message.channel.guild.voiceAdapterCreator,
        })
        const subscription = connection.subscribe(player);
        const resource = createAudioResource(audioFie);
        player.play(resource);
        return true;
    }
    return false;
}

// Message replies
client.on("messageCreate", function (message) {
    if (message.author.bot) return;
    if (message.member.roles.cache.some(role => role.name === "Bot Abuser")) return;
    let command = message.content.toLowerCase();
	
	if (command.includes("cooler")) {
		message.react('🐟');
	}
    botMessage = "";

    if (command.includes("where is andy") || command.includes("wheres andy") || command.includes("where\'s andy")) {
        botMessage += WhereIsAndy() + "\n";
    }
    if (command.includes("translate")) {
        botMessage += Translate() + "!" + "\n";
    }
    if (command.includes("bazinga") || command.includes("zimbabwe")) {
        botMessage += "Bazinga!\n";
    }
    if (command.includes("im hungry") || command.includes("i\'m hungry")) {
        botMessage += "Then go eat.\n";
    }
    if (command.includes("other side")) {
        botMessage += "The other what?\n";
    }
    if (command.includes("take it back")) {
        botMessage += "Now y'all.\n";
    }
    if (command.includes("no shot")) {
        botMessage += "Shot.\n";
    }
    if (command.includes("shot") && !command.includes("no shot")) {
        botMessage += "No shot.\n";
    }
    if (command.includes("pam")) {
        botMessage += "PAM!\n";
    }
    if (command.includes("gamers")) {
        botMessage += gamersResponse() + "\n";
    }
    if (command.includes("blind")) {
        botMessage += "You mean \"" + command.replace("blind", "~~blind~~ doing a first playthrough no spoilers") + "\"";
    }
    if (command.includes("166")) {
        message.channel.send("", { files: ["https://media.discordapp.net/attachments/158049091434184705/795546735594045450/unknown.png"] });
    }
    if (command.includes("when is andy getting a new computer") || command.includes("whens andy getting a new computer") || command.includes("when\'s andy getting a new computer")) {
        botMessage += getAndyComputerDate(); + "\n";
    }
    if (command.includes("too late")) {
        botMessage += "But you promised." + "\n";
    }
    if (command.includes("hellhalt") || command.includes("hell halt") ) {
        let sadge = '';
        if (emotes.sadge) sadge = emotes.sadge;
        botMessage += `I'm a leak, I'm a leak. ${emotes.sadge}` + "\n";
    }
	if (command.includes("woah") || command.includes("whoa")) {
        botMessage += "Basement Gang!" + "\n";
        playAudioFile(message, 'audio/basementgang.mp3');
    }
    if (command.includes("thunder") || command.includes("lightning")) {
        playAudioFile(message, 'audio/thundervslightning.mp3');
    }
    if (command.includes("groan")) {
        playAudioFile(message, 'audio/groan.mp3');
    } 

    if (botMessage) {
        message.channel.send(botMessage);
    }
});

// Slash commands
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'play') {
        console.log(interaction.options);
        let reply = 'You are not in a voice channel';
        if (playAudioFile(interaction, `audio/${interaction.options.getString('audio')}.mp3`)) {
            reply = `Playing ${interaction.options.getString('audio')}.`;
        }
        await interaction.reply({ content: reply, ephemeral: true });
	}
    else if (commandName === 'roll') {
		await interaction.reply(Math.floor(Math.random() * (99) + 1).toString());
	}
});

// Hourly water and posture check
let scheduledMessage = new cron.CronJob('00 00 * * * *', () => {
	let channel = client.channels.cache.get('899162908498468934');
	if (channel) {
		channel.send(`<@&899160433548722176> Water Check. Posture Check.`);
	}
    else {
        console.log('Water/Posture Check channel not found.');
    }
});
scheduledMessage.start();

client.login(config.BOT_TOKEN);
client.once('ready', () => {
	console.log('Same5JokesBot online.');
    emotes['sadge'] = client.emojis.cache.find(emoji => emoji.name === "Sadge");
});