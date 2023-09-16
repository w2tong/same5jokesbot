import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import lotteryManager from '../../lotteryManager';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ephemeral: true});
    const user = interaction.user;
    const msgs = [];

    const ticketsToBuy = interaction.options.getInteger('number') ?? lotteryManager.ticketLimit;
    let ticketsBought = 0;

    while (ticketsBought < ticketsToBuy) {
        const {success, res} = await lotteryManager.buyTicket(user, lotteryManager.generateNumbersArray(), interaction.client, interaction.channelId);
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
    .setDescription(`Buy up to ${lotteryManager.ticketLimit} lottery tickets (${lotteryManager.price} points each). Numbers are automatically picked.`)
    .addIntegerOption(option => option
        .setName('number')
        .setDescription('Enter the number of tickets to buy.')
        .setMinValue(1)
        .setMaxValue(lotteryManager.choose)
    );

export default { execute, name, subcommandBuilder };