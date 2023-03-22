import { Client, GatewayIntentBits, Events } from 'discord.js';
import * as dotenv from 'dotenv';
dotenv.config();
import createCronJobs from './create-cronjobs';
import { getEmotes } from './emotes';
import messageCreateHandler from './events/messageCreateHandler';
import interactionCreateHandler from './events/interactionCreateHandler';
import voiceStateUpdateHandler from './events/voiceStateUpdateHandler';
import winston from 'winston';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates] });

// On messages
client.on(Events.MessageCreate, messageCreateHandler);

// Slash commands
client.on(Events.InteractionCreate, interactionCreateHandler);

// On channel move/mute/deafen
client.on(Events.VoiceStateUpdate, voiceStateUpdateHandler);

// Login with bot token
client.login(process.env.BOT_TOKEN).catch((err: Error) => {
    logger.log({
        level: 'error',
        message: err.message,
        stack: err.stack
    });
});

client.once(Events.ClientReady, (): void => {

    // Add emotes from server to emotes object
    getEmotes(client);

    // Cronjobs
    createCronJobs(client);

    console.log('Same5JokesBot online.');
});

const format = winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} ${level}: ${message}\n${stack}`;
});

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.timestamp({
            format: 'MMM-DD-YYYY HH:mm:ss',
        }),
        format
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/error.log' })
    ]
});
winston.loggers.add('error-logger', logger);

client.on(Events.ShardError, err => {
    logger.log({
        level: 'error',
        message: err.message,
        stack: err.stack
    });
});