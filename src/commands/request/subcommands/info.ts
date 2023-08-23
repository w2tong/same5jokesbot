import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { fetchAudioRequestPrice } from '../requestManager';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const embed = new EmbedBuilder()
        .setTitle('Request Info')
        .addFields(
            {name: 'Type', value: 'Audio', inline: true},
            {name: 'Price', value: `${(await fetchAudioRequestPrice()).toLocaleString()}`, inline: true}
        )
    ;
    await interaction.editReply({embeds: [embed]});
}

const name = 'info';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Get info about requests.');

export default { execute, name, subcommandBuilder };