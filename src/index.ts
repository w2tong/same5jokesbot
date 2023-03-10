import { Client, GatewayIntentBits, Message, TextChannel, Interaction, GuildMember, ChannelType, Events } from 'discord.js';
import * as dotenv from 'dotenv';
dotenv.config();
import createCronJobs from './create-cronjobs';
import { getEmotes } from './emotes';
import { getMomentCurrentTimeEST } from './util'
import { createPlayer, createVoiceConnection, playAudioFile } from './voice'
import messageCreateHandler from './events/messageCreate';
import interactionCreateHandler from './events/interactionCreate';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates] });
let mainChannel: TextChannel | undefined;

client.on(Events.MessageCreate, messageCreateHandler);

// Slash commands
client.on(Events.InteractionCreate, interactionCreateHandler);

// On channel move/mute/deafen
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {

    // Return if user is a bot
    if (oldState.member?.user.bot) return;

    // Message when Azi leaves or chance when someone else leaves
    if ((newState.member?.id == process.env.AZI_ID || Math.random() < 0.10) && newState.channelId == null && oldState.guild.id === process.env.GUILD_ID) {
        if (mainChannel && mainChannel.type === ChannelType.GuildText) {
            mainChannel.send('You made Azi leave.').catch((e) => console.log(`Error sending to mainChannel: ${e}`));
        }
    }

    // Return if voice state update is itself
    if (oldState.id === client.user?.id) return;

    // Play teleporting fat guy when moving between channels
    if (oldState.channelId && newState.channelId && oldState.channelId != newState.channelId) {
        const voiceConnection = {
            channelId: newState.channelId,
            guildId: newState.guild.id,
            adapterCreator: newState.guild.voiceAdapterCreator,
            selfDeaf: false
        }
        const player = createPlayer();
        const connection = createVoiceConnection(voiceConnection, player, newState.client);
        await playAudioFile(connection, player, 'teleporting_fat_guy_short', oldState.member?.user.username);
    }

    // Play Good Morning Donda when joining channel in the morning
    if (newState.channelId && oldState.channelId == null) {
        const hour = getMomentCurrentTimeEST().utc().tz('America/Toronto').hour();
        if (hour >= 4 && hour < 12) {
            const voiceConnection = {
                channelId: newState.channelId,
                guildId: newState.guild.id,
                adapterCreator: newState.guild.voiceAdapterCreator,
                selfDeaf: false
            }
            const player = createPlayer();
            const connection = createVoiceConnection(voiceConnection, player, newState.client);
            await playAudioFile(connection, player, 'good_morning_donda', oldState.member?.user.username);
        }
    }
});

// Login with bot token
client.login(process.env.BOT_TOKEN);
client.once(Events.ClientReady, (): void => {

    // Add emotes from server to emotes object
    getEmotes(client);

    // Get main channel
    let channel = client.channels.cache.get(process.env.MAIN_CHANNEL_ID ?? '');
    if (channel?.type === ChannelType.GuildText) {
        mainChannel = channel;
    }

    // Cronjobs
    createCronJobs(client)

    console.log('Same5JokesBot online.');
});