import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { getUserGambleProfits } from '../../../sql/tables/gamble-profits';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const user = interaction.options.getUser('user') ?? interaction.user;
    const profitStats = await getUserGambleProfits(user.id);
    if (!profitStats) {
        void interaction.editReply(`${user} has have never gambled.`);
        return;
    }
    const embed = new EmbedBuilder()
        .setTitle(`${user.username}'s Gambling Profits`)
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
    .setDescription('Gets a user\'s gamble profits.')
    .addUserOption((option) => option.setName('user').setDescription('Select a user'));

export default { execute, name, subcommandBuilder };