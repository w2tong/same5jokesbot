const Discord = require("discord.js");
const config = require("./config.json");

const client = new Discord.Client();

const verbs = ["Walking", "Washing", "Eating"];
const nouns = ["dog", "dishes", "dinner"];
const translations = ["Prance forward", "Shashay left", "Boogie down", "Shimmy right"];
const gamers = ["Rise up!", "Disperse!", "Discharge!"];

function RandomRange(max)
{
    return Math.floor(Math.random() * max);
}

function WhereIsAndy()
{
    var verb = verbs[RandomRange(verbs.length)];
    var noun = nouns[RandomRange(nouns.length)];
    return verb + " his " + noun + ".";
}

function Translate()
{
    return translations[RandomRange(translations.length)];
}

function gamersResponse()
{
    return gamers[RandomRange(gamers.length)]; 
}

client.on("message", function(message) { 
    if (message.author.bot) return;
    var command = message.content.toLowerCase();
    if (command.includes("where is andy?") || command.includes("where is andy") || command.includes("wheres andy") || command.includes("where's is andy"))
    {
        message.channel.send(WhereIsAndy());
    }
    else if (command.includes("translate"))
    {
        message.channel.send(Translate() + "!");
    }
    else if (command.includes("bazinga") || command.includes("zimbabwe"))
    {
        message.channel.send("Bazinga!");
    }
    else if (command.includes("im hungry") || command.includes("i'm hungry"))
    {
        message.channel.send("Then go eat.");
    }
    else if (command.includes("other side"))
    {
        message.channel.send("The other what?");
    }
    else if (command.includes("take it back"))
    {
        message.channel.send("Now y'all.");
    }
    else if (command.includes("no shot"))
    {
        message.channel.send("Shot.");
    }
    else if (command.includes("pam"))
    {
        message.channel.send("PAM!");
    }
    else if (command.includes("gamers"))
    {
        message.channel.send(gamersResponse());
    }
});      

client.login(config.BOT_TOKEN);
console.log("Same5JokesBot online");