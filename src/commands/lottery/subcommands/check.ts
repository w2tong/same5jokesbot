import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import lotteryManager from '../lotteryManager';
import { joinVoicePlayAudio } from '../../../voice';
import audio from '../../../util/audioFileMap';

async function execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.user;
    await interaction.deferReply();
    const check = await lotteryManager.checkTickets(user.id, user.username);
    if (check.winnings > 0) joinVoicePlayAudio(interaction, audio.winnerGagnant);
    await interaction.editReply(check.reply);
}

const name = 'check';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Check your tickets for the current lottery.');

export default { execute, name, subcommandBuilder };