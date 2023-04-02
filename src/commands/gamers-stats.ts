import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getGamersStats } from '../sql/gamers-stats';

const decimalPlaces = 2;

async function execute(interaction: ChatInputCommandInteraction) {
    const gamerCounter = await getGamersStats(interaction.user.id);
    if (!gamerCounter) {
        void interaction.reply('No stats available.');
    }
    else {
        const sum = gamerCounter.DISCHARGE + gamerCounter.DISPERSE + gamerCounter.RISE_UP;
        const dischargePercent = (gamerCounter.DISCHARGE / sum * 100).toFixed(decimalPlaces);
        const dispersePercent = (gamerCounter.DISPERSE / sum * 100).toFixed(decimalPlaces);
        const riseUpPercent = (gamerCounter.RISE_UP / sum * 100).toFixed(decimalPlaces);
        const gamersStatsEmbed = new EmbedBuilder()
            .setTitle(`${interaction.user.username}'s Gamers Stats`)
            .addFields(
                { name: 'Gamers', value: 'Discharge!\nDisperse!\nRise up!', inline: true },
                { name: 'Hits', value: `${gamerCounter.DISCHARGE}\n${gamerCounter.DISPERSE}\n${gamerCounter.RISE_UP}`, inline: true },
                { name: 'Hit Rate', value: `${dischargePercent}%\n${dispersePercent}%\n${riseUpPercent}%`, inline: true }
            );
        void interaction.reply({ embeds: [gamersStatsEmbed] });
    }
}

const name = 'gamers-stats';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Gets your Gamer stats for this server.');

export default { execute, name, commandBuilder };