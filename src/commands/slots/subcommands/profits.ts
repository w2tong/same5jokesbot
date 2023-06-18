import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { getUserSlotsProfits } from '../../../sql/tables/slots-profits';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const user = interaction.options.getUser('user') ?? interaction.user;
    const profitStats = await getUserSlotsProfits(user.id);
    if (!profitStats) {
        void interaction.editReply(`${user} has have never spun the slot machine.`);
        return;
    }
    const embed = new EmbedBuilder()
        .setTitle(`${user.username} Slots Profits`)
        .addFields(
            {name: 'Winnings', value: `${profitStats.WINNINGS.toLocaleString()}`, inline: true},
            {name: 'Losses', value: `${profitStats.LOSSES.toLocaleString()}`, inline: true},
            {name: 'Profits', value: `${profitStats.PROFITS.toLocaleString()}`, inline: true}
        );
    void interaction.editReply({embeds: [embed]});
}

const name = 'profits';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Gets a user\'s cringe point slots profits.')
    .addUserOption((option) => option.setName('user').setDescription('Select a user'));

export default { execute, name, subcommandBuilder };