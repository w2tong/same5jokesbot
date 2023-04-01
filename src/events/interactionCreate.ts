import { Interaction } from 'discord.js';
import { commands } from '../commands/commands';

export default (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;
        for (const command of commands) {
            if (command.name === commandName) {
                command.execute(interaction);
                return;
            }
        }
    }
    else {
        return;
    }
};