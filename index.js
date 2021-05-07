const Discord = require("discord.js");
const config = require("./config.json");

const client = new Discord.Client();

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

client.on("message", function (message) {
	if (message.author.bot) return;
	if (message.member.roles.cache.some(role => role.name === "Bot Abuser")) return;
	let command = message.content.toLowerCase();
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
	else if (command.includes("im hungry") || command.includes("i\'m hungry")) {
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
	if (command.includes("too late") ) {
		botMessage += "But you promised." + "\n";
	}

	if (botMessage) {
		message.channel.send(botMessage);
	}
});

client.login(config.BOT_TOKEN);
console.log("Same5JokesBot online");