import { Interaction } from 'discord.js';
import { commands } from '../commands/commands';
import { logError } from '../logger';

export default (interaction: Interaction) => {
    if (interaction.isChatInputCommand() && commands[interaction.commandName]) {
        try {
            commands[interaction.commandName](interaction);
        }
        catch (err) {
            logError(err);
            interaction.reply('Error executing command.').catch(logError);
        }
    }
    else {
        return;
    }
};