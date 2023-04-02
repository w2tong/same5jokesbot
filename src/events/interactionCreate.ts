import { Interaction } from 'discord.js';
import { commands } from '../commands/commands';
import { logError } from '../logger';

export default (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;
        for (const command of commands) {
            if (command.name === commandName) {
                try {
                    command.execute(interaction);
                    return;
                }
                catch (err) {
                    logError(err);
                    interaction.reply('Error executing command.').catch(logError);
                }
            }
        }
    }
    else {
        return;
    }
};