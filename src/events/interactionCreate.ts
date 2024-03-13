import { Interaction } from 'discord.js';
import { commandExecute, commandAutocomplete } from '../commands/commands';
import { logError } from '../logger';

export default (interaction: Interaction) => {
    if (interaction.isChatInputCommand() && commandExecute[interaction.commandName]) {
        try {
            commandExecute[interaction.commandName](interaction);
        }
        catch (err) {
            logError(err);
            interaction.reply('Error executing command.').catch(logError);
        }
    }
    else if (interaction.isAutocomplete() && commandAutocomplete[interaction.commandName]) {
        try {
            void commandAutocomplete[interaction.commandName](interaction);
        }
        catch (err) {
            logError(err);
        }
    }

    return;
};