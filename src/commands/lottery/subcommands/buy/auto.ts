import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import lottery from '../../lotteryManager';
import lotteryManager from '../../lotteryManager';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ephemeral: true});
    const user = interaction.user;
    const msgs = [];
    const buyMax = interaction.options.getBoolean('buy-max');

    const ticketsToBuy = buyMax ? lottery.choose : 1;
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
    .setDescription(`Buy a lottery ticket (${lottery.price} points). Numbers are automatically picked. Max of ${lottery.ticketLimit} tickets.`)
    .addBooleanOption(option => option
        .setName('buy-max')
        .setDescription('Buy the max amount of tickets')
    );

export default { execute, name, subcommandBuilder };