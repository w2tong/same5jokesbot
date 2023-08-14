import { Client, GatewayIntentBits, Events, ChannelType } from 'discord.js';
import * as dotenv from 'dotenv';
dotenv.config();
import createCronJobs from './createCronjobs';
import { getEmotes } from './util/emotes';
import { initOracleDB } from './sql/oracledb';
import { loadReminders } from './commands/reminder/reminderManager';
import timeInVoice from './timeInVoice';
import { logError } from './logger';
import messageCreateHandler from './events/messageCreate';
import interactionCreateHandler from './events/interactionCreate';
import voiceStateUpdateHandler, { initMainChannel } from './events/voiceStateUpdate';
import { initVoiceLogChannel } from './voice';
import { fetchChannel, fetchUser } from './util/discordUtil';
import { loadStolenGoods } from './commands/steal/stealManager';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates] });

// On messages
client.on(Events.MessageCreate, messageCreateHandler);

// Slash commands
client.on(Events.InteractionCreate, interactionCreateHandler);

// On channel move/mute/deafen
client.on(Events.VoiceStateUpdate, voiceStateUpdateHandler);

// Login with bot token
client.login(process.env.BOT_TOKEN).catch(logError);
client.once(Events.ClientReady, async () => {

    // Fetch all guilds and members
    process.stdout.write('Fetching discord guilds and members.');
    await client.guilds.fetch();
    for (const guild of client.guilds.cache.values()) {
        await guild.members.fetch();
    }
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write('Done fetching discord guilds and members.\n');

    // Init voice log channel
    process.stdout.write('Initializing main channel.');
    await initMainChannel(client);
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write('Done initializing main channel.\n');

    process.stdout.write('Initializing voice channel.');
    await initVoiceLogChannel(client);
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write('Done initializing voice channel.\n');

    // Add emotes from server to emotes object
    process.stdout.write('Getting emotes.');
    getEmotes(client);
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write('Done getting emotes.\n');

    // Cronjobs
    process.stdout.write('Creating Cronjobs.');
    createCronJobs(client);
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write('Done creating Cronjobs.\n');

    // Init db
    process.stdout.write('Initializing Oracle DB.');
    await initOracleDB();
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write('Done initializing Oracle DB.\n');

    process.stdout.write('Loading reminders.');
    await loadReminders(client);
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write('Done loading reminders.\n');

    process.stdout.write('Loading stolen goods.');
    await loadStolenGoods();
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write('Done loading stolen goods.\n');

    // Init users in voice channels
    process.stdout.write('Initializing users in voice.');
    timeInVoice.initUsers(client);
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write('Done initializing users in voice.\n');

    console.log('Same5JokesBot online.');
    if (process.env.STATUS_CHANNEL_ID) {
        const statusChannel = await fetchChannel(client.channels, process.env.STATUS_CHANNEL_ID);
        if (statusChannel?.type === ChannelType.GuildText) {
            void statusChannel.send('Same5JokesBot online.');
        }
    }
    // if (process.env.CASINO_CHANNEL_ID) {
    //     const casinoChannel = await fetchChannel(client.channels, process.env.CASINO_CHANNEL_ID);
    //     if (casinoChannel?.type === ChannelType.GuildText) {
    //         void casinoChannel.send('The casino is open!');
    //     }
    // }
    if (process.env.OWNER_USER_ID) {
        const owner = await fetchUser(client.users, process.env.OWNER_USER_ID);
        void owner.send('Same5JokesBot online.');
    }
});

// client.on(Events.ShardError, err => {
//     logError(err);
// });