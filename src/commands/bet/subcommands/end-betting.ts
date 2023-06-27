import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { getBet, endBet } from '../betManager';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const betName = getBet(interaction.user.id)?.getName();
    let reply = 'You don\'t have an active bet.';
    if (await endBet(interaction.user.id, interaction.client)) {
        reply = `Bet ${betName} betting ended.`;
    }
    void interaction.editReply(reply);
}

const name = 'end-betting';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('End betting for you current bet.');

export default { execute, name, subcommandBuilder };