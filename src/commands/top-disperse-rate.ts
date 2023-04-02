import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getTopDisperseRate } from '../sql/gamers-stats';

async function execute(interaction: ChatInputCommandInteraction) {
    const topDisperseRate = await getTopDisperseRate();
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
            .setTitle('Top Disperse Rates')
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
    .setDescription('Gets disperse rate of all users.');

export default { execute, name, commandBuilder };