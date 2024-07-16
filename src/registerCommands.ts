import { REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';
dotenv.config();
import { commandBuilders } from './commands/commands';

async function registerCommands(guildId?: string) {
    if (process.env.BOT_TOKEN && process.env.CLIENT_ID) {
        const commands = commandBuilders.map(command => command.toJSON());
        console.log(`Registering application commands${guildId ? ` for guild ${guildId}` : ''}.`);
        const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);
        if (!guildId) {
            await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
                body: commands,
            });
        }
        else {
            await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId), {
                body: commands 
            });
        }
        
        console.log(`Successfully registered application commands ${guildId ? ` for guild ${guildId}` : ''}.`);
    }
}

export default registerCommands;