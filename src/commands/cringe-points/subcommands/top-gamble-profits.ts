import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { getTopGambleProfits } from '../../../sql/gamble-profits';
import { createUserNumberedList, fetchUser } from '../../../discordUtil';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const topProfitStats = await getTopGambleProfits();
    if (!topProfitStats) {
        void interaction.editReply('Error getting top gamble profits.');
        return;
    }

    const users = [];
    const profits = [];
    for (const {USER_ID, PROFITS} of topProfitStats) {
        users.push(fetchUser(interaction.client.users, USER_ID));
        profits.push(PROFITS);
    }
    const usersFieldValue = await createUserNumberedList(users);
    const profitsFieldValue = profits.join('\n');
    const embed = new EmbedBuilder()
        .setTitle('Top Gambling Profits')
        .addFields(
            {name: 'Users', value: usersFieldValue, inline: true},
            {name: 'Profits', value: profitsFieldValue, inline: true}
        );
    void interaction.editReply({embeds: [embed]});
}

const name = 'top-gamble-profits';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Gets cringe point top gamble profits.');

export default { execute, name, subcommandBuilder };