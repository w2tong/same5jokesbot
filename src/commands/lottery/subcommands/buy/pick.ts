import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import lotteryManager from '../../lotteryManager';

async function execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.user;
    await interaction.deferReply({ephemeral: true});
    const nums: number[] = [];
    for (let i = 1; i <= lotteryManager.choose; i++) {
        const num = interaction.options.getInteger(`num${i}`);
        if (!num) {
            await interaction.editReply('There was an error retrieving your numbers.');
            return;
        }
        nums.push(num);
    }
    nums.sort((a,b) => a-b);
    const {success, res} = await lotteryManager.buyTicket(user, nums, interaction.client, interaction.channelId);
    void interaction.editReply(res);
    if (success) void interaction.channel?.send(`${user} bought a lottery ticket.`);
}

const name = 'pick';

const minNum = 1;
const maxNum = lotteryManager.numbers.length;
const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription(`Buy a lottery ticket (${lotteryManager.price} points). Each number must be unique. Max of ${lotteryManager.ticketLimit} tickets.`);
for (let i = 1; i <= lotteryManager.choose; i++) {
    subcommandBuilder.addIntegerOption(option => option
        .setName(`num${i}`)
        .setDescription(`Enter number ${i}.`)
        .setRequired(true)
        .setMinValue(minNum)
        .setMaxValue(maxNum)
    );
}

export default { execute, name, subcommandBuilder };