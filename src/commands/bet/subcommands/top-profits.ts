import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { getTopBetProfits } from '../../../sql/tables/bet-profits';
import { createUserNumberedList, fetchUser } from '../../../discordUtil';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const topProfitStats = await getTopBetProfits();
    if (!topProfitStats.length) {
        void interaction.editReply('Error getting top betting profits.');
        return;
    }

    const users = [];
    const profits = [];
    for (const {USER_ID, PROFITS} of topProfitStats) {
        users.push(fetchUser(interaction.client.users, USER_ID));
        profits.push(PROFITS.toLocaleString());
    }
    const usersFieldValue = await createUserNumberedList(users);
    const profitsFieldValue = profits.join('\n');
    const embed = new EmbedBuilder()
        .setTitle('Top Betting Profits')
        .addFields(
            {name: 'Users', value: usersFieldValue, inline: true},
            {name: 'Profits', value: profitsFieldValue, inline: true}
        );
    void interaction.editReply({embeds: [embed]});
}

const name = 'top-profits';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Gets cringe point top betting profits.');

export default { execute, name, subcommandBuilder };