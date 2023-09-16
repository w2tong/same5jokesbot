import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder, bold } from 'discord.js';
import { deleteLotteryAutoBuy, getUserLotteryAutoBuy, insertLotteryAutoBuy } from '../../../sql/tables/lottery_auto_buy';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const user = interaction.user;
    const result = await getUserLotteryAutoBuy(user.id);
    if (!result) {
        await insertLotteryAutoBuy(user.id);
        await interaction.editReply(`Lottery Auto Buy turned ${bold('ON')}.`);
    }
    else {
        await deleteLotteryAutoBuy(user.id);
        await interaction.editReply(`Lottery Auto Buy turned ${bold('OFF')}.`);
    }
}

const name = 'toggle-auto-buy';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Toggle automatically buying tickets when a new lottery starts.');

export default { execute, name, subcommandBuilder };