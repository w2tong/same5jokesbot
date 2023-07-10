import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import lottery from '../../lotteryManager';
import lotteryManager from '../../lotteryManager';

async function execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.user;
    await interaction.deferReply({ephemeral: true});
    const {success, res} = await lotteryManager.buyTicket(user.id, lottery.generateNumbersArray());
    void interaction.editReply(res);
    if (success) void interaction.channel?.send(`${user} bought a lottery ticket.`);
}

const name = 'auto';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription(`Buy a lottery ticket (${lottery.price} points). Numbers are automatically picked. Max of ${lottery.ticketLimit} tickets.`);

export default { execute, name, subcommandBuilder };