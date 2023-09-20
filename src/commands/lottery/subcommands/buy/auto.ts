import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import lotteryManager from '../../lotteryManager';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ephemeral: true});
    const user = interaction.user;
    const ticketsToBuy = interaction.options.getInteger('number') ?? lotteryManager.ticketLimit;

    const {msg, ticketsBought} = await lotteryManager.buyAuto(user, ticketsToBuy, interaction.client, interaction.channelId);
    
    void interaction.editReply(msg);
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