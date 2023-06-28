import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { getTotalGamersStatsMonthYear, getTotalGamersStatsYear } from '../../../sql/tables/gamers-stats';

const decimalPlaces = 2;

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const date = new Date();
    let month = interaction.options.getString('month');
    const year = interaction.options.getInteger('year');
    let gamerCounter;
    let dateStr;
    if (year && !month) {
        gamerCounter = await getTotalGamersStatsYear(year.toString());
        dateStr = year;
    }
    else {
        const yearStr = (year ?? date.getFullYear()).toString();
        month = month ?? (date.getMonth() + 1).toString();
        gamerCounter = await getTotalGamersStatsMonthYear(month, yearStr);
        dateStr = `${month}/${yearStr}`;
    }
    
    if (gamerCounter) {
        const sum = gamerCounter.DISCHARGE + gamerCounter.DISPERSE + gamerCounter.RISE_UP;
        const dischargePercent = (gamerCounter.DISCHARGE / sum * 100).toFixed(decimalPlaces);
        const dispersePercent = (gamerCounter.DISPERSE / sum * 100).toFixed(decimalPlaces);
        const riseUpPercent = (gamerCounter.RISE_UP / sum * 100).toFixed(decimalPlaces);
        const gamersStatsEmbed = new EmbedBuilder()
            .setTitle(`Total Gamers Stats (${dateStr})`)
            .addFields(
                { name: 'Gamers', value: 'Discharge!\nDisperse!\nRise up!', inline: true },
                { name: 'Hits', value: `${gamerCounter.DISCHARGE}\n${gamerCounter.DISPERSE}\n${gamerCounter.RISE_UP}`, inline: true },
                { name: 'Hit Rate', value: `${dischargePercent}%\n${dispersePercent}%\n${riseUpPercent}%`, inline: true }
            );
        void interaction.editReply({ embeds: [gamersStatsEmbed] });
    }
    else {
        void interaction.editReply('No stats available.');
    }
}

const name = 'total';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Gets total gamer stats of all users.')
    .addStringOption((option) => option.setName('month').setDescription('Select a month').addChoices(
        {name: '1. January', value: '1'},
        {name: '2. February', value: '2'},
        {name: '3. March', value: '3'},
        {name: '4. April', value: '4'},
        {name: '5. May', value: '5'},
        {name: '6. June', value: '6'},
        {name: '7. March', value: '7'},
        {name: '8. July', value: '8'},
        {name: '9. August', value: '9'},
        {name: '10. Septemper', value: '10'},
        {name: '11. November', value: '11'},
        {name: '12. December', value: '12'}
    ))
    .addIntegerOption((option) => option.setName('year').setDescription('Select a year'));

export default { execute, name, subcommandBuilder };