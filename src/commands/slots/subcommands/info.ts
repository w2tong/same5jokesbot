import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { Emotes, emotes } from '../../../util/emotes';
import { slotsSymbols, symbols } from '../symbols';

const values: Array<string> = [];
const multipliers: Array<number> = [];
for (const symbol of Object.values(slotsSymbols)) {
    values.push(`${symbol.pc * 100}%`);
    multipliers.push(symbol.mult);
}

const {pc, mult} = symbols[symbols.length-1];
const pcString = `${pc*100}%`;
const payoutExamples = [
    `${pcString} x ${mult}¹ = ${pc*mult**1}x`,
    `${pcString} x ${mult}² = ${pc*mult**2}x`,
    `${pcString} x ${mult}³ = ${pc*mult**3}x`,
    `${pcString} x ${mult}⁴ = ${pc*mult**4}x`,
];

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const symbolFieldValue = (Object.values(slotsSymbols).map(symbol => emotes[symbol.emote])).join('\n');
    const symbolEmoteStr = emotes[Emotes.ChugU].toString();
    const symbolExamples = [
        symbolEmoteStr.repeat(2),
        symbolEmoteStr.repeat(3),
        symbolEmoteStr.repeat(4),
        symbolEmoteStr.repeat(5),
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