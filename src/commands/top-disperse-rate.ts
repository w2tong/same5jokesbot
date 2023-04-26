import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getTopDisperseRate } from '../sql/gamers-stats';

async function execute(interaction: ChatInputCommandInteraction) {
    const date = new Date();
    const month = interaction.options.getString('month') ?? (date.getMonth() + 1).toString();
    const year = (interaction.options.getNumber('year') ?? date.getFullYear()).toString();
    const topDisperseRate = await getTopDisperseRate(month, year);
    if (topDisperseRate.length === 0) {
        void interaction.reply('No stats available.');
    }
    else {
        let namesField = '';
        let dispersePercentField = '';
        let totalField = '';
        for (let i = 0; i < topDisperseRate.length; i++) {
            namesField += `${i+1}. ${(await interaction.client.users.fetch(topDisperseRate[i].USER_ID)).username}\n`;
            dispersePercentField += `${topDisperseRate[i].DISPERSE_PC.toFixed(2)}%\n`;
            totalField += `${topDisperseRate[i].SUM}\n`;
        }
            
        const rowDisperseRateEmbed = new EmbedBuilder()
            .setTitle(`Top Disperse Rates (${month}/${year})`)
            .addFields(
                { name: 'Name', value: namesField, inline: true },
                { name: 'Disperse %', value: dispersePercentField, inline: true },
                { name: 'Gamers Total', value: totalField, inline: true }
            );
        void interaction.reply({ embeds: [rowDisperseRateEmbed] });
    }
}

const name = 'top-disperse-rate';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Gets disperse rate of all users.')
    .addStringOption((option) => option.setName('month').setDescription('Select a month').addChoices(
        {name: 'January', value: '1'},
        {name: 'February', value: '2'},
        {name: 'March', value: '3'},
        {name: 'April', value: '4'},
        {name: 'May', value: '5'},
        {name: 'June', value: '6'},
        {name: 'March', value: '7'},
        {name: 'July', value: '8'},
        {name: 'August', value: '9'},
        {name: 'Septemper', value: '10'},
        {name: 'November', value: '11'},
        {name: 'December', value: '12'}
    ))
    .addStringOption((option) => option.setName('year').setDescription('Select a year'));

export default { execute, name, commandBuilder };