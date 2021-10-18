const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, BOT_TOKEN } = require('./config.json');

const playCommand = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays selected audio clip')
    .addStringOption(option =>
		option.setName('audio')
			.setDescription('The audio clip')
			.setRequired(true)
			.addChoice('Thunder vs Lightning', 'thundervslightning')
            .addChoice('Phasmo Attack', 'attack')
            .addChoice('Phasmo Breath', 'breath')
            .addChoice('Phasmo Die', 'die')
            .addChoice('Phasmo Groan', 'groan')
            .addChoice('Phasmo Kill', 'kill')
    );

const rollCommand = new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Rolls a random number from 1 to 100')
    //.addIntegerOption(option => option.setName('int').setDescription('Enter an integer'))
    ;

const commands = [playCommand, rollCommand].map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(BOT_TOKEN);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);