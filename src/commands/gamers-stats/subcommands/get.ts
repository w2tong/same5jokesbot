import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { getGamersStatsMonthYear, getGamersStatsYear } from '../../../sql/tables/gamers-stats';
import { monthChoices } from '../../../util/discordUtil';

const decimalPlaces = 2;

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const date = new Date();
    let month = interaction.options.getString('month');
    const year = interaction.options.getInteger('year');
    let gamerCounter;
    let dateStr;
    if (year && !month) {
        gamerCounter = await getGamersStatsYear(interaction.user.id, year.toString());
        dateStr = year;
    }
    else {
        const yearStr = (year ?? date.getFullYear()).toString();
        month = month ?? (date.getMonth() + 1).toString();
        gamerCounter = await getGamersStatsMonthYear(interaction.user.id, month, yearStr);
        dateStr = `${month}/${yearStr}`;
    }
    
    if (gamerCounter) {
        const sum = gamerCounter.DISCHARGE + gamerCounter.DISPERSE + gamerCounter.RISE_UP;
        const dischargePercent = (gamerCounter.DISCHARGE / sum * 100).toFixed(decimalPlaces);
        const dispersePercent = (gamerCounter.DISPERSE / sum * 100).toFixed(decimalPlaces);
        const riseUpPercent = (gamerCounter.RISE_UP / sum * 100).toFixed(decimalPlaces);
        const gamersStatsEmbed = new EmbedBuilder()
            .setTitle(`${interaction.user.username}'s Gamers Stats (${dateStr})`)
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

const name = 'get';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Gets your Gamer stats.')
    .addStringOption((option) => option.setName('month').setDescription('Select a month').addChoices(
        ...monthChoices
    ))
    .addIntegerOption((option) => option.setName('year').setDescription('Select a year'));

export default { execute, name, subcommandBuilder };