import { REST } from 'discord.js';
import { Routes } from 'discord-api-types/v9';
import * as dotenv from 'dotenv';
dotenv.config();
import { commandBuilders } from './commands/commands';

const commands = commandBuilders.map((command) => command.toJSON());

async function registerCommands() {
    if (process.env.BOT_TOKEN && process.env.CLIENT_ID && process.env.GUILD_ID) {
        const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
            body: commands,
        });
        console.log('Successfully registered application commands.');
    }
}

void registerCommands();