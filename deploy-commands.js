const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, BOT_TOKEN } = require('./config.json');

const playCommand = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Ahhhhhhhhhhhhhhhhhhhhhhhhh')
    .addStringOption(option =>
		option.setName('audio')
			.setDescription('The audio clip')
			.setRequired(true)
			.addChoice('Thunder vs Lightning', 'thundervslightning')
			.addChoice('Phasmo Groan', 'groan'));

const rollCommand = new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Rolls a number from 1 to 100.');

const commands = [playCommand, rollCommand].map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(BOT_TOKEN);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);