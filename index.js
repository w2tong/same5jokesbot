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
    botMessage = "";
    if (command.includes("where is andy?") || command.includes("where is andy") || command.includes("wheres andy") || command.includes("where's is andy"))
    {
        botMessage += WhereIsAndy() + "\n";
    }
    if (command.includes("translate"))
    {
        botMessage += Translate() + "!" + "\n";
    }
    if (command.includes("bazinga") || command.includes("zimbabwe"))
    {
        botMessage += "Bazinga!\n";
    }
    if (command.includes("im hungry") || command.includes("i'm hungry"))
    {
        botMessage += "Then go eat.\n";
    }
    if (command.includes("other side"))
    {
        botMessage += "The other what?\n";
    }
    if (command.includes("take it back"))
    {
        botMessage += "Now y'all.\n";
    }
    if (command.includes("no shot"))
    {
        botMessage += "Shot.\n";
    }
    if (command.includes("pam"))
    {
        botMessage += "PAM!\n";
    }
    if (command.includes("gamers"))
    {
        botMessage += gamersResponse() + "\n";
    }
    if (botMessage)
    {
        message.channel.send(botMessage);
    }
    
});      

client.login(config.BOT_TOKEN);
console.log("Same5JokesBot online");