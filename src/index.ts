import { Client, GatewayIntentBits, Events, ChannelType, User } from 'discord.js';
import { createCronJobs } from './cronjobs';
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
import { loadDailyProgress } from './daily/dailyManager';
import { loadUpgrades } from './upgrades/upgradeManager';
import { exitCode } from 'process';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates] });
let owner: User;

// On messages
client.on(Events.MessageCreate, messageCreateHandler);

// Slash commands
client.on(Events.InteractionCreate, interactionCreateHandler);

// On channel move/mute/deafen
client.on(Events.VoiceStateUpdate, voiceStateUpdateHandler);

// Login with bot token
client.login(process.env.BOT_TOKEN).catch(logError);
client.once(Events.ClientReady, async () => {
    if (process.env.OWNER_USER_ID) {
        owner = await fetchUser(client, process.env.OWNER_USER_ID);
    }

    // Fetch all guilds and members
    console.log('Fetching discord guilds and members.');
    await client.guilds.fetch();
    for (const guild of client.guilds.cache.values()) {
        await guild.members.fetch();
    }
    console.log('Done fetching discord guilds and members.\n');

    // Init voice log channel
    console.log('Initializing main channel.');
    await initMainChannel(client);
    console.log('Done initializing main channel.\n');

    console.log('Initializing voice channel.');
    await initVoiceLogChannel(client);
    console.log('Done initializing voice channel.\n');

    // Add emotes from server to emotes object
    console.log('Getting emotes.');
    getEmotes(client);
    console.log('Done getting emotes.\n');

    // Init db
    console.log('Initializing Oracle DB.');
    await initOracleDB();
    console.log('Done initializing Oracle DB.\n');

    // Cronjobs
    console.log('Creating Cronjobs.');
    await createCronJobs(client);
    console.log('Done creating Cronjobs.\n');

    console.log('Loading reminders.');
    await loadReminders(client);
    console.log('Done loading reminders.\n');

    console.log('Loading stolen goods.');
    await loadStolenGoods();
    console.log('Done loading stolen goods.\n');

    console.log('Loading daily progress.');
    await loadDailyProgress();
    console.log('Done loading daily progress.\n');

    console.log('Loading upgrades.');
    await loadUpgrades();
    console.log('Done loading upgrades.\n');

    // Init users in voice channels
    console.log('Initializing users in voice.');
    timeInVoice.initUsers(client);
    console.log('Done initializing users in voice.\n');

    console.log('Same5JokesBot online.');
    if (process.env.STATUS_CHANNEL_ID) {
        const statusChannel = await fetchChannel(client, process.env.STATUS_CHANNEL_ID);
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
    void owner.send('Same5JokesBot online.');
});

// client.on(Events.ShardError, err => {
//     logError(err);
// });

process.on('exit', () => {
    console.log(`Exit code: ${exitCode}`);
});

process.on('uncaughtException', (err) =>{
    owner.send(`${err.name}\n${err.message}`)
        .catch(err => console.error(err))
        .finally(() => {
            console.log('Destroying Discord client.');
            client.destroy()
                .then(() => console.log('Discord client destroyed.'))
                .catch(err => console.error(err))
                .finally(() => 
                    process.exit(1)
                );
        });
});

export default client;