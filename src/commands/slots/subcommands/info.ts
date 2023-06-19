import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { emotes } from '../../../emotes';
import symbols from '../symbols';

const values: Array<string> = [];
const multipliers: Array<number> = [];
for (const symbol of symbols) {
    values.push(`${symbol.pc * 100}%`);
    multipliers.push(symbol.mult);
}

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const symbolFieldValue = (symbols.map(symbol => emotes[symbol.emote])).join('\n');
    const symbolExamples = [
        emotes['vacation'].toString().repeat(2),
        emotes['vacation'].toString().repeat(3),
        emotes['vacation'].toString().repeat(4),
        emotes['vacation'].toString().repeat(5),
    ];
    const payoutExamples = [
        '50% x 10¹ = 5x',
        '50% x 10² = 50x',
        '50% x 10³ = 500x',
        '50% x 10⁴ = 5000x',
    ];
    const embed = new EmbedBuilder()
        .setTitle('Slots Info')
        .setDescription('Symbols must be adjacent to win.')
        .addFields(
            {name: 'Symbol', value: symbolFieldValue, inline: true},
            {name: 'Value (% of bet)', value: values.join('\n'), inline: true},
            {name: 'Multiplier', value: multipliers.join('\n'), inline: true},
            {name: 'Example Symbol', value: symbolExamples.join('\n'), inline: true},
            {name: 'Example Payout', value: payoutExamples.join('\n'), inline: true}
        );
    void interaction.editReply({embeds: [embed]});
}

const name = 'info';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Gets info about slots.');

export default { execute, name, subcommandBuilder };