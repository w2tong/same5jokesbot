import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import lottery from '../../lotteryManager';
import lotteryManager from '../../lotteryManager';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ephemeral: true});
    const user = interaction.user;
    const msgs = [];

    const ticketsToBuy = lottery.choose;
    let ticketsBought = 0;

    while (ticketsBought < ticketsToBuy) {
        const {success, res} = await lotteryManager.buyTicket(user.id, lottery.generateNumbersArray());
        msgs.push(res);
        if (!success) break;
        ticketsBought++;
    }
    
    void interaction.editReply(msgs.join('\n'));
    if (ticketsBought > 0) void interaction.channel?.send(`${user} bought ${ticketsBought} lottery ticket${ticketsBought > 1  ? 's' : ''}.`);
}

const name = 'auto';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription(`Buy the max number of lottery tickets (${lottery.price} points). Numbers are automatically picked. Max of ${lottery.ticketLimit} tickets.`);

export default { execute, name, subcommandBuilder };