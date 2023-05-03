import { Client, GatewayIntentBits, Events } from 'discord.js';
import * as dotenv from 'dotenv';
dotenv.config();
import createCronJobs from './create-cronjobs';
import { getEmotes } from './emotes';
import { initOracleDB } from './sql/oracledb';
import { loadReminders } from './reminders';
import timeInVoice from './time-in-voice';
import { logError } from './logger';
import messageCreateHandler from './events/messageCreate';
import interactionCreateHandler from './events/interactionCreate';
import voiceStateUpdateHandler from './events/voiceStateUpdate';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates] });

// On messages
client.on(Events.MessageCreate, messageCreateHandler);

// Slash commands
client.on(Events.InteractionCreate, interactionCreateHandler);

// On channel move/mute/deafen
client.on(Events.VoiceStateUpdate, voiceStateUpdateHandler);

// Login with bot token
client.login(process.env.BOT_TOKEN).catch(logError);

client.once(Events.ClientReady, async () => {

    // Add emotes from server to emotes object
    getEmotes(client);

    // Cronjobs
    createCronJobs(client);

    // Init db
    await initOracleDB();
    await loadReminders(client);

    // Init users in voice channels
    timeInVoice.initUsers(client);

    console.log('Same5JokesBot online.');
});

client.on(Events.ShardError, err => {
    logError(err);
});