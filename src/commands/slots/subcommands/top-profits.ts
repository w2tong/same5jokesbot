import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder, userMention } from 'discord.js';
import { getTopSlotsProfits, getTotalSlotsProfits } from '../../../sql/tables/slots-profits';
import { emptyEmbedField } from '../../../util/discordUtil';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const topProfitStats = await getTopSlotsProfits();
    const totalProfitStats = await getTotalSlotsProfits();
    if (!topProfitStats.length || !totalProfitStats) {
        void interaction.editReply('No one has ever spun the slot machine.');
        return;
    }

    const users = [];
    const profits = [];
    for (const {USER_ID, PROFITS} of topProfitStats) {
        users.push(userMention(USER_ID));
        profits.push(PROFITS.toLocaleString());
    }
    const usersFieldValue = users.join('\n');
    const profitsFieldValue = profits.join('\n');
    const embed = new EmbedBuilder()
        .setTitle('Top Slots Profits')
        .addFields(
            {name: 'Total Winnings', value: `${totalProfitStats.WINNINGS.toLocaleString()}`, inline: true},
            {name: 'Total Losses', value: `${totalProfitStats.LOSSES.toLocaleString()}`, inline: true},
            {name: 'Total Profits', value: `${totalProfitStats.PROFITS.toLocaleString()}`, inline: true},
            {name: 'Users', value: usersFieldValue, inline: true},
            emptyEmbedField,
            {name: 'Profits', value: profitsFieldValue, inline: true}
        );
    void interaction.editReply({embeds: [embed]});
}

const name = 'top-profits';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Gets cringe point top slots profits.');

export default { execute, name, subcommandBuilder };