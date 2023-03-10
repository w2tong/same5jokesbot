import { ChannelType, Client, TextChannel } from "discord.js";
import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, createAudioResource, DiscordGatewayAdapterCreator, entersState, getVoiceConnection, joinVoiceChannel, VoiceConnection, VoiceConnectionState, VoiceConnectionStatus } from "@discordjs/voice";
import { join } from 'node:path';
import regexToAudio from "./regex-to-audio";
import { getMomentCurrentTimeEST } from "./util";
// @ts-ignore
import Transcriber from 'discord-speech-to-text';

let timeoutId: NodeJS.Timer | null = null;
const transcriber = new Transcriber(process.env.WITAI_KEY);

const networkStateChangeHandler = (oldNetworkState: VoiceConnectionState, newNetworkState: VoiceConnectionState) => {
    const newUdp = Reflect.get(newNetworkState, 'udp');
    clearInterval(newUdp?.keepAliveInterval);
}

// Creates AudioPlayer and add event listeners
function createPlayer(): AudioPlayer {
    const player = createAudioPlayer();
    // Disconnect after 15 min of inactivity
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
            const connection = getVoiceConnection(process.env.GUILD_ID ?? '')
            try {
                player.stop();
                connection?.destroy();
            }
            catch (e) {
                console.log(e)
            }
            timeoutId = null;
        }, 600000);
    });

    return player;
}

async function playAudioFile(connection: VoiceConnection, player: AudioPlayer, audioFile: string, username?: string): Promise<void> {
    connection.subscribe(player);
    console.log(`[${new Date().toLocaleTimeString('en-US')}] ${username} played ${audioFile}`);
    const resource = createAudioResource(join(__dirname, `audio/${audioFile}.mp3`));
    player.play(resource);
}

interface voiceConnection {
    channelId: string,
    guildId: string,
    adapterCreator: DiscordGatewayAdapterCreator,
    selfDeaf: boolean
}

// Creates VoiceConnection and add event listeners
let isRateLimited = false;
function createVoiceConnection(voiceConnection: voiceConnection, player: AudioPlayer, client: Client, voiceLogChannel: TextChannel): VoiceConnection {
    const connection = joinVoiceChannel(voiceConnection);
    connection.setMaxListeners(1);
    connection.receiver.speaking.setMaxListeners(1);

    // Add event listener on receiving voice input
    if (connection.receiver.speaking.listenerCount('start') === 0) {
        connection.receiver.speaking.on('start', async (userId) => {
            const user = client.users.cache.get(userId);
            // Return if speaker is a bot
            if (user?.bot) return;
            transcriber.listen(connection.receiver, userId, user).then((data: any) => {

                // Send rate limited message and return
                if (Object.keys(data.transcript).length === 0) {
                    if (isRateLimited === false) {
                        isRateLimited = true;
                        if (voiceLogChannel) voiceLogChannel.send(`[${getMomentCurrentTimeEST().format('h:mm:ss a')}] Rate limited. Try again in 1 minute.`);
                    }
                    return;
                }
                // Process text
                isRateLimited = false;
                // Return if no text
                if (!data.transcript.text) return;
                const text = data.transcript.text.toLowerCase();
                const username = user?.username;

                // Log voice messages to console and discord channel
                const voiceTextLog = `[${getMomentCurrentTimeEST().format('h:mm:ss a')}] ${username}: ${text}`
                console.log(voiceTextLog);
                if (voiceLogChannel) voiceLogChannel.send(voiceTextLog).catch((e) => console.log(`Error sending to voiceLogChannel: ${e}`));

                // Stop audio voice command
                if (/hey bot stop/.test(text)) {
                    player.stop();
                    return;
                }

                // Return if audio is already playing
                if (player.state.status === AudioPlayerStatus.Playing) return;

                // Play any audio where text matches regex
                for (let regexAudio of regexToAudio) {
                    const audio = regexAudio.getAudio();
                    if (regexAudio.regex.test(text) && audio) {
                        playAudioFile(connection, player, audio, username);
                        break;
                    }
                }
            });
        });
    }

    // Remove listeners on disconnect
    if (connection.listenerCount(VoiceConnectionStatus.Disconnected) === 0) {
        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
                // Seems to be reconnecting to a new channel - ignore disconnect
            }
            catch (e) {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                }
                // Seems to be a real disconnect which SHOULDN'T be recovered from
                try {
                    player.stop();
                    connection.destroy();
                }
                catch (e) {
                    console.log(e)
                }
            }
        })
    }

    // Temp fix for Discord UDP packet issue
    if (connection.listenerCount('stateChange') === 0) {
        connection.on('stateChange', (oldState, newState) => {
            Reflect.get(oldState, 'networking')?.off('stateChange', networkStateChangeHandler);
            Reflect.get(newState, 'networking')?.on('stateChange', networkStateChangeHandler);
        });
    }
    return connection;
}

export { createPlayer, createVoiceConnection, playAudioFile }