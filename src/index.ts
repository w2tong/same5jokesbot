import { Client, GatewayIntentBits, Message, TextChannel, Interaction, GuildMember, ChannelType, Events } from 'discord.js';
import * as dotenv from 'dotenv';
dotenv.config();
import createCronJobs from './create-cronjobs';
import regexToText from './regex-to-text';
import regexToAudio from './regex-to-audio';
import regexToReact from './regex-to-react';
import { getEmotes } from './emotes';
import { getMomentCurrentTimeEST } from './util'
import { createPlayer, createVoiceConnection, playAudioFile } from './voice'

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates] });
let mainChannel: TextChannel | undefined;
let voiceLogChannel: TextChannel;

// Responses to text messages
client.on(Events.MessageCreate, async (message: Message): Promise<void> => {
    // Don't respond to bots
    if (message.author.bot) return;
    // Don't respond to Bot Abuser role
    if (message.member && message.member.roles.cache.some(role => role.name === 'Bot Abuser')) return;
    // Return if incorrect channel type
    if (message.channel.type !== ChannelType.GuildText) return;

    const command = message.content.toLowerCase();

    //React with emoji
    for (const regexReact of regexToReact) {
        const react = regexReact.getReact()
        if (react && regexReact.regex.test(command)) {
            message.react(react);
        }
    }
    // Text replies
    let botMessage = '';
    for (let regexText of regexToText) {
        if (regexText.regex.test(command) && message.member) {
            const text = regexText.getText(command, message.member?.displayName);
            botMessage += `${text}\n`;
        }
    }
    // Send message
    if (botMessage) {
        message.channel.send(botMessage).catch((e) => console.log(`Error sending message: ${e}`));;
    }
    // Audio replies
    for (let regexAudio of regexToAudio) {
        const audio = regexAudio.getAudio();
        if (regexAudio.regex.test(command) && audio && message.member && message.member.voice.channel && message.guild) {
            const voiceConnection = {
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
                selfDeaf: false
            }
            const player = createPlayer();
            const connection = createVoiceConnection(voiceConnection, player, client, voiceLogChannel);
            await playAudioFile(connection, player, audio, message.member.user.username);
            break;
        }
    }
});

// Slash commands
client.on(Events.InteractionCreate, async (interaction: Interaction): Promise<void> => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;
    // Play audio
    if (commandName === 'play' && interaction.member instanceof GuildMember && interaction.guild && interaction.member.voice.channel) {
        const voiceConnection = {
            channelId: interaction.member.voice.channel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
            selfDeaf: false
        }
        const audioFile = interaction.options.getString('audio') ?? ''
        const reply = interaction.member.voice ? `Playing ${audioFile}.` : 'You are not in a voice channel.';
        interaction.reply({ content: reply, ephemeral: true });
        const player = createPlayer();
        const connection = createVoiceConnection(voiceConnection, player, client, voiceLogChannel);
        await playAudioFile(connection, player, audioFile, interaction.member.user.username)
    }
    // Reply with a number between 1 and 100 (or min and max)
    else if (commandName === 'roll') {
        const min = interaction.options.getInteger('min') ?? 1;
        const max = interaction.options.getInteger('max') ?? 100;
        interaction.reply(Math.floor(Math.random() * (max + 1 - min) + min).toString());
    }
});

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
        const connection = createVoiceConnection(voiceConnection, player, client, voiceLogChannel);
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
            const connection = createVoiceConnection(voiceConnection, player, client, voiceLogChannel);
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
    // Get voice log channel
    channel = client.channels.cache.get(process.env.VOICE_LOG_CHANNEL_ID ?? '');
    if (channel?.type === ChannelType.GuildText) {
        voiceLogChannel = channel;
    }

    // Cronjobs
    createCronJobs(client)

    console.log('Same5JokesBot online.');
});
