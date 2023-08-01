import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { dailyTaxBracket } from '../../../taxes';

const brackets: string[] = [];
const rates: string[] = [];
for (const [bracket, rate] of Object.entries(dailyTaxBracket)) {
    brackets.push(parseInt(bracket).toLocaleString());
    rates.push(`${(rate*100).toFixed(1)}%`);
}

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const embed = new EmbedBuilder()
        .setTitle('Tax Info')
        .setDescription('Taxes are paid at 2:00AM ET.')
        .addFields(
            {name: 'Bracket', value: brackets.join('\n'), inline: true},
            {name: 'Rate', value: rates.join('\n'), inline: true}
        )
    ;
    await interaction.editReply({embeds: [embed]});
}

const name = 'info';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Get info about taxes.');

export default { execute, name, subcommandBuilder };