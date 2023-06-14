import { Client, GatewayIntentBits, Events, ChannelType } from 'discord.js';
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
import voiceStateUpdateHandler, { initMainChannel } from './events/voiceStateUpdate';
import { initVoiceLogChannel } from './voice';
import { fetchChannel, fetchUser } from './discordUtil';

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
    await client.guilds.fetch();
    for (const guild of client.guilds.cache.values()) {
        await guild.members.fetch();
    }

    // Init voice log channel
    await initMainChannel(client);
    await initVoiceLogChannel(client);

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
    if (process.env.STATUS_CHANNEL_ID) {
        const channel = await fetchChannel(client.channels, process.env.STATUS_CHANNEL_ID);
        if (channel?.type === ChannelType.GuildText) {
            void channel.send('Same5JokesBot online.');
        }
    }
    if (process.env.OWNER_USER_ID) {
        const owner = await fetchUser(client.users, process.env.OWNER_USER_ID);
        void owner.send('Same5JokesBot online.');
    }
    
});

// client.on(Events.ShardError, err => {
//     logError(err);
// });