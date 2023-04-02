import { ChannelType, Client, Message, TextChannel } from 'discord.js';
import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, createAudioResource, DiscordGatewayAdapterCreator, entersState, getVoiceConnection, joinVoiceChannel, VoiceConnection, VoiceConnectionStatus } from '@discordjs/voice';
import { join } from 'node:path';
import { logError } from './logger';
import getAudioResponse from './regex-responses/audio';
import { getMomentCurrentTimeEST } from './util';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import Transcriber from 'discord-speech-to-text';

interface GuildConnection {
    connection: VoiceConnection;
    player: AudioPlayer;
    timeoutId: NodeJS.Timer | undefined;
}
interface voiceConnection {
    channelId: string;
    guildId: string;
    adapterCreator: DiscordGatewayAdapterCreator;
}
interface transcriberData {
    transcript: {
        text: string;
    };
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const transcriber = new Transcriber(process.env.WITAI_KEY);
const timeout = 900_000; // Timeout in milliseconds 
const guildConnections: { [key: string]: GuildConnection } = {};
const speakingTimeout = 100;
const userSpeakingTimeout = new Set();

function disconnectVoice(guildId: string) {
    if (!guildConnections[guildId]) return;
    guildConnections[guildId].connection.destroy();
    guildConnections[guildId].player.stop();
    clearTimeout(guildConnections[guildId].timeoutId);
    delete guildConnections[guildId];
}

// Creates AudioPlayer and add event listeners
function createPlayer(guildId: string): AudioPlayer {
    const player = createAudioPlayer();
    // Reset timeout when audio playing
    player.on(AudioPlayerStatus.Playing, (): void => {
        if (guildConnections[guildId] && guildConnections[guildId].timeoutId) {
            clearTimeout(guildConnections[guildId].timeoutId);
            guildConnections[guildId].timeoutId = undefined;
        }
    });
    // Start timeout timer when idle
    player.on(AudioPlayerStatus.Idle, (): void => {
        guildConnections[guildId].timeoutId = setTimeout(() => {
            disconnectVoice(guildId);
        }, timeout);
        
    });

    return player;
}

function playAudioFile(guildId: string, audioFile: string, username?: string) {
    if (!audioFile) return;
    const player = guildConnections[guildId].player;
    if (!player) return;
    console.log(`[${new Date().toLocaleTimeString('en-US')}] ${username ?? ''} played ${audioFile}`);
    const resource = createAudioResource(join(__dirname, `audio/${audioFile}.mp3`));
    player.play(resource);
}

// Creates VoiceConnection and add event listeners
let isRateLimited = false;
let rateLimitedMessage: Message|null = null;
function joinVoice(voiceConnection: voiceConnection, client: Client) {
    const guildId = voiceConnection.guildId;

    // Only update connection if connection to guild already exists
    if (getVoiceConnection(guildId)&& guildConnections[guildId]) {
        const connection = joinVoiceChannel({ ...voiceConnection, selfDeaf: false });
        guildConnections[guildId].connection = connection;
        return;
    }

    // Add connection, player and event listeners if new connection
    const connection = joinVoiceChannel({ ...voiceConnection, selfDeaf: false });
    const player = createPlayer(guildId);
    connection.subscribe(player);

    guildConnections[guildId] = {
        connection,
        player,
        timeoutId: undefined
    };

    // Get voice log channel
    let voiceLogChannel: TextChannel;
    const channel = client.channels.cache.get(process.env.VOICE_LOG_CHANNEL_ID ?? '');
    if (channel?.type === ChannelType.GuildText) {
        voiceLogChannel = channel;
    }

    // Add event listener on receiving voice input
    connection.receiver.speaking.on('start', (userId) => {

        // Add timeout to prevent multiple voice activations from same user
        if (userSpeakingTimeout.has(userId)) return;
        userSpeakingTimeout.add(userId);
        setTimeout(() => {
            userSpeakingTimeout.delete(userId);
        }, speakingTimeout);

        // Get user
        const user = client.users.cache.get(userId);
        // Return if speaker is a bot
        if (user?.bot) return;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        transcriber.listen(connection.receiver, userId, user).then((data: transcriberData) => {
    
            // Send rate limited message and return
            if (Object.keys(data.transcript).length === 0) {
                if (isRateLimited === false) {
                    isRateLimited = true;
                    if (voiceLogChannel) {
                        voiceLogChannel.send(`[${getMomentCurrentTimeEST().format('h:mm:ss a')}] Rate limited. Try again in 1 minute.`)
                            .then((message) => { rateLimitedMessage = message; }).catch(logError);
                    }
                }
                return;
            }
    
            // Process text
            isRateLimited = false;
            if (rateLimitedMessage) {
                rateLimitedMessage.delete().catch(logError);
                rateLimitedMessage = null;
            }
            if (!data.transcript.text) return; // Return if no text
            const text = data.transcript.text.toLowerCase();
            const username = user?.username;
    
            // Log voice messages to console and discord channel
            const voiceTextLog = `[${getMomentCurrentTimeEST().format('h:mm:ss a')}] ${username}: ${text}`;
            console.log(voiceTextLog);
            if (voiceLogChannel) voiceLogChannel.send(voiceTextLog).catch(logError);
    
            // Stop audio voice command
            if (/bot,? (stop|shut up)/.test(text)) {
                player.stop();
                return;
            }

            if (/bot,? (leave|dc|disconnect|get out|disperse)/.test(text)) {
                disconnectVoice(guildId);
                return;
            }
    
            // Return if audio is already playing
            if (player.state.status === AudioPlayerStatus.Playing) return;
    
            // Play any audio where text matches regex
            const audio = getAudioResponse(text, userId);
            playAudioFile(guildId, audio, username);
        });
    });

    // Remove listeners on disconnect
    connection.on(VoiceConnectionStatus.Disconnected, () => {
        void (async () => {
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
                // Seems to be reconnecting to a new channel - ignore disconnect
            } catch (e) {
                // Seems to be a real disconnect which SHOULDN'T be recovered from
                disconnectVoice(guildId);
            }
        })();
    });
}

export { joinVoice, playAudioFile };