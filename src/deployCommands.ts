import { REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';
dotenv.config();
import { commandBuilders } from './commands/commands';

const commands = commandBuilders.map(command => command.toJSON());

async function registerCommands() {
    if (process.env.BOT_TOKEN && process.env.CLIENT_ID && process.env.GUILD_ID) {
        console.log('Registering application commands.');
        const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
            body: commands,
        });
        console.log('Successfully registered application commands.');
    }
}

try {
    void registerCommands();
}
catch (err) {
    console.error(err);
}