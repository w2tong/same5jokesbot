import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { getBet, deleteBet } from '../betManager';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const betName = getBet(interaction.user.id)?.getName();
    let reply = 'You don\'t have an active bet.';
    if (await deleteBet(interaction.user.id, interaction.client)) {
        reply = `Bet ${betName} deleted.`;
    }
    void interaction.editReply(reply);
}

const name = 'delete';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Delete your current bet.');

export default { execute, name, subcommandBuilder };