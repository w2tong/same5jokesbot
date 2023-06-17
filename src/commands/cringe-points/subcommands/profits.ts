import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { getUserGambleProfits } from '../../../sql/gamble-profits';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const user = interaction.options.getUser('user') ?? interaction.user;
    const profitStats = await getUserGambleProfits(user.id);
    if (!profitStats) {
        void interaction.editReply(`${user} has have never gambled Cringe points.`);
        return;
    }
    const embed = new EmbedBuilder()
        .setTitle(`${user.username} Gambling Profits`)
        .addFields(
            {name: 'Winnings', value: `${profitStats.WINNINGS}`, inline: true},
            {name: 'Losses', value: `${profitStats.LOSSES}`, inline: true},
            {name: 'Profits', value: `${profitStats.PROFITS}`, inline: true}
        );
    void interaction.editReply({embeds: [embed]});
}

const name = 'profits';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Gets a user\'s cringe point gamble profits.')
    .addUserOption((option) => option.setName('user').setDescription('Select a user'));

export default { execute, name, subcommandBuilder };