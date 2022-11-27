import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import * as dotenv from 'dotenv';
dotenv.config();

const playCommand = new SlashCommandBuilder()
	.setName('play')
	.setDescription('Plays selected audio clip')
	.addStringOption((option) =>
		option
			.setName('audio')
			.setDescription('Audio clip')
			.setRequired(true)
			.addChoice('Thunder vs Lightning', 'thunder_vs_lightning')
			.addChoice('Phasmo Breath', 'phasmo_breath')
			/*
            .addChoice('Phasmo Die', 'phasmo_die')
            .addChoice('Phasmo Groan', 'phasmo_groan')
            .addChoice('Phasmo Heartbeat', 'phasmo_heartbeat')
            .addChoice('Phasmo Kill', 'phasmo_kill')
            .addChoice('Phasmo Behind', 'phasmo_behind')
            */
			.addChoice('Phasmo Here', 'phasmo_here')
			.addChoice('Among Us Emergency Meeting', 'amongus_meeting')
			.addChoice('Disgustang', 'disgustang')
			.addChoice('Demon Time', 'demontime')
			.addChoice('What the dog doin', 'whatthedogdoin')
			.addChoice('Beans', 'beans')
			.addChoice('Beans Slow', 'beans_slow')
			.addChoice('NOIDONTTHINKSO', 'NOIDONTTHINKSO')
			.addChoice('Uh guys?', 'uhguys')
			.addChoice('ENOUGH TALK', 'ENOUGHTALK')
			.addChoice('Champ Select', 'champ_select')
			.addChoice('TRUE', 'TRUE')
			.addChoice('Moonmoon destroys Weebs', 'moonmoon_destroys_weebs')
			.addChoice('Bing Chilling', 'bing_chilling')
			.addChoice('An Exclusive! It Arrived', 'an_exclusive_it_arrived')
			.addChoice('Smosh: Shut Up!', 'smosh_shut_up')
			.addChoice('Get ready! M.O.A.B.!', 'get_ready_MOAB')
			.addChoice('Clean-cut, and still cuts a tomato.', 'clean_cuts')
			.addChoice('Game over, man.', 'game_over_man')
			.addChoice('Fulcrum, come in', 'fulcrum_come_in')
			.addChoice('Obliterated', 'obliterated')
			.addChoice('FADEDTHANAHO', 'FADEDTHANAHO')
			.addChoice('Good Morning Donda', 'good_morning_donda')
			.addChoice('Teleporting Fat Guy', 'teleporting_fat_guy')
	);

const rollCommand = new SlashCommandBuilder()
	.setName('roll')
	.setDescription('Rolls a random number from 1 to 100 (or min and max)')
	.addIntegerOption((option) => option.setName('min').setDescription('Enter an integer'))
	.addIntegerOption((option) => option.setName('max').setDescription('Enter an integer'));
const commands = [playCommand, rollCommand].map((command) => command.toJSON());

if (process.env.BOT_TOKEN && process.env.CLIENT_ID && process.env.GUILD_ID) {
	const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);
	rest
		.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
			body: commands,
		})
		.then(() => console.log('Successfully registered application commands.'))
		.catch(console.error);
}
