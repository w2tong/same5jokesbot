import { ChannelType, Client, TextChannel } from 'discord.js';
import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, createAudioResource, DiscordGatewayAdapterCreator, entersState, getVoiceConnection, joinVoiceChannel, VoiceConnection, VoiceConnectionStatus } from '@discordjs/voice';
import { join } from 'node:path';
import logger from './logger';
import regexToAudio from './events/regex/regex-to-audio';
import { getMomentCurrentTimeEST } from './util';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import Transcriber from 'discord-speech-to-text';

type Timer = NodeJS.Timer | null;
interface GuildConnection {
    connection: VoiceConnection,
    player: AudioPlayer,
    timeoutId: Timer
}
interface voiceConnection {
    channelId: string,
    guildId: string,
    adapterCreator: DiscordGatewayAdapterCreator
}

interface transcriberData {
    transcript: {
        text: string
    }
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const transcriber = new Transcriber(process.env.WITAI_KEY);
const timeout = 600_000; // Timeout in milliseconds 
const guildConnections: { [key: string]: GuildConnection } = {};

// Creates AudioPlayer and add event listeners
function createPlayer(connection: VoiceConnection, timeoutId: Timer, guildId: string): AudioPlayer {
    const player = createAudioPlayer();
    // Reset timeout when audio playing
    player.on(AudioPlayerStatus.Playing, (): void => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    });
    // Start timeout timer when idle
    player.on(AudioPlayerStatus.Idle, (): void => {
        timeoutId = setTimeout(() => {
            player.stop();
            delete guildConnections[guildId];
            try {
                connection.destroy();
            } catch (e) {
                console.log(e);
            }
            timeoutId = null;
        }, timeout);
    });

    return player;
}

function playAudioFile(guildId: string, audioFile: string, username?: string) {
    const player = guildConnections[guildId].player;
    if (!player) return;
    console.log(`[${new Date().toLocaleTimeString('en-US')}] ${username ?? ''} played ${audioFile}`);
    const resource = createAudioResource(join(__dirname, `audio/${audioFile}.mp3`));
    player.play(resource);
}

// Creates VoiceConnection and add event listeners
let isRateLimited = false;
function joinVoice(voiceConnection: voiceConnection, client: Client) {
    const guildId = voiceConnection.guildId;
    if (getVoiceConnection(guildId)) {
        const connection = joinVoiceChannel({ ...voiceConnection, selfDeaf: false });
        guildConnections[guildId].connection = connection;
        return;
    }
    const connection = joinVoiceChannel({ ...voiceConnection, selfDeaf: false });
    let timeoutId: Timer = null;
    const player = createPlayer(connection, timeoutId, guildId);
    connection.subscribe(player);

    // Add player, connection, timeoutId to guildConnections
    guildConnections[guildId] = {
        connection,
        player,
        timeoutId: null
    };

    // Get voice log channel
    let voiceLogChannel: TextChannel;
    const channel = client.channels.cache.get(process.env.VOICE_LOG_CHANNEL_ID ?? '');
    if (channel?.type === ChannelType.GuildText) {
        voiceLogChannel = channel;
    }

    // Add event listener on receiving voice input
    connection.receiver.speaking.on('start', (userId) => {
        const user = client.users.cache.get(userId);
        // Return if speaker is a bot
        if (user?.bot) return;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        transcriber.listen(connection.receiver, userId, user).then((data: transcriberData) => {
    
            // Send rate limited message and return
            if (Object.keys(data.transcript).length === 0) {
                if (isRateLimited === false) {
                    isRateLimited = true;
                    if (voiceLogChannel) voiceLogChannel.send(`[${getMomentCurrentTimeEST().format('h:mm:ss a')}] Rate limited. Try again in 1 minute.`).catch((err: Error) => logger.error({
                        message: err.message,
                        stack: err.stack
                    }));
                }
                return;
            }
    
            // Process text
            isRateLimited = false;
            if (!data.transcript.text) return; // Return if no text
            const text = data.transcript.text.toLowerCase();
            const username = user?.username;
    
            // Log voice messages to console and discord channel
            const voiceTextLog = `[${getMomentCurrentTimeEST().format('h:mm:ss a')}] ${username}: ${text}`;
            console.log(voiceTextLog);
            if (voiceLogChannel) voiceLogChannel.send(voiceTextLog)
                .catch((err: Error) => logger.error({
                    message: `Error sending to voiceLogChannel: ${err.message}`,
                    stack: err.stack
                }));
    
            // Stop audio voice command
            if (/hey bot stop/.test(text)) {
                player.stop();
                return;
            }
    
            // Return if audio is already playing
            if (player.state.status === AudioPlayerStatus.Playing) return;
    
            // Play any audio where text matches regex
            for (const regexAudio of regexToAudio) {
                const audio = regexAudio.getAudio();
                if (regexAudio.regex.test(text) && audio) {
                    playAudioFile(guildId, audio, username);
                    break;
                }
            }
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
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                }
                player.stop();
                delete guildConnections[guildId];
                try {
                    connection.destroy();
                } catch (e) {
                    console.log(e);
                }
            }
        })();
    });
}

export { joinVoice, playAudioFile };