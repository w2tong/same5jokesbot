import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder, userMention } from 'discord.js';
import { getTopDisperseRateMonthYear, getTopDisperseRateYear } from '../../../sql/tables/gamers_stats';
import { monthChoices } from '../../../util/discordUtil';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const date = new Date();
    let month = interaction.options.getString('month');
    const year = interaction.options.getInteger('year');
    let topDisperseRate;
    let dateStr;
    if (year && !month) {
        topDisperseRate = await getTopDisperseRateYear(year.toString());
        dateStr = year;
    }
    else {
        const yearStr = (year ?? date.getFullYear()).toString();
        month = month ?? (date.getMonth() + 1).toString();
        topDisperseRate = await getTopDisperseRateMonthYear(month, yearStr);
        dateStr = `${month}/${yearStr}`;
    }

    if (topDisperseRate.length) {
        const users = [];
        const dispersePcs = [];
        const totals = [];
        for (const {USER_ID, DISPERSE_PC, SUM} of topDisperseRate) {
            users.push(userMention(USER_ID));
            dispersePcs.push(parseFloat(DISPERSE_PC.toFixed(2)));
            totals.push(SUM);
        }
        const userFieldValue = users.join('\n');
        const dispersePcFieldValue = dispersePcs.join('\n');
        const totalFieldValue = totals.join('\n');
            
        const embed = new EmbedBuilder()
            .setTitle(`Top Disperse Rates (${dateStr})`)
            .addFields(
                { name: 'User', value: userFieldValue, inline: true },
                { name: 'Disperse %', value: dispersePcFieldValue, inline: true },
                { name: 'Gamers Total', value: totalFieldValue, inline: true }
            );
        void interaction.editReply({ embeds: [embed] });
    }
    else {
        void interaction.editReply('No stats available.');
    }
}

const name = 'top-rate';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Gets disperse rate of all users.')
    .addStringOption((option) => option.setName('month').setDescription('Select a month.').addChoices(
        ...monthChoices
    ))
    .addIntegerOption((option) => option.setName('year').setDescription('Select a year.'));

export default { execute, name, subcommandBuilder };