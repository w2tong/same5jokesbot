import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { getTimeInVoice } from '../../../sql/tables/time-in-voice';
import { msToString } from '../../../util/util';

async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;
    await interaction.deferReply();
    const dateRange = interaction.options.getString('date-range');
    const timeInVoice = await getTimeInVoice(interaction.user.id, interaction.guildId, dateRange ?? '');
    if (timeInVoice) {
        void interaction.editReply(msToString(timeInVoice.MILLISECONDS));
    }
    else {
        void interaction.editReply('You have no time in voice in this guild.');
    }
}

const name = 'get';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Gets your time in voice channels in this guild.')
    .addStringOption((option) => option.setName('date-range').setDescription('Date range').addChoices(
        {name: 'Today', value: 'today'},
        {name: 'This Month', value: 'month'},
        {name: 'This Year', value: 'year'},
        {name: 'Total', value: 'total'},
    ));

export default { execute, name, subcommandBuilder };