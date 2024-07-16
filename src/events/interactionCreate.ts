import { Interaction } from 'discord.js';
import { commandExecute, commandAutocomplete } from '../commands/commands';

export default (interaction: Interaction) => {
    if (interaction.isChatInputCommand() && commandExecute[interaction.commandName]) {
        try {
            commandExecute[interaction.commandName](interaction);
        }
        catch (err) {
            console.error(err);
            interaction.reply('Error executing command.').catch(console.error);
        }
    }
    else if (interaction.isAutocomplete() && commandAutocomplete[interaction.commandName]) {
        void commandAutocomplete[interaction.commandName](interaction).catch(console.error);
    }

    return;
};