import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getTimeInVoice } from '../sql/time-in-voice';
import { msToString } from '../util';

async function execute(interaction: ChatInputCommandInteraction) {
    if (interaction.guildId) {
        const timeInVoice = await getTimeInVoice(interaction.user.id, interaction.guildId);
        if (timeInVoice) {
            void interaction.reply(msToString(timeInVoice.MILLISECONDS));
        }
        else {
            void interaction.reply('You have no time in voice in this guild.');
        }
    }
}

const name = 'time-in-voice';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Gets your total time in voice channels.');

export default { execute, name, commandBuilder };