import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { stealPcMax, stealMax, victimExtraPc, houseExtraPc } from '../stealManager';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const embed = new EmbedBuilder()
        .setTitle('Steal Info')
        .setDescription(`
        You can steal up to ${stealPcMax*100}% of a user's balance up to ${stealMax.toLocaleString()} points.
        
        If you fail, you must forfeit all stolen goods you are currently holding, and you must give back an extra percentage of the points you stole.

        Stolen goods are held for 15 minutes before being safe.
        `)
        .addFields(
            {name: 'Outcome', value: 'Success\nFail (Victim)\nFail (House)', inline: true},
            {name: 'Chance', value: '40%\n55%\n5%', inline: true},
            {name: 'Extra %', value: `N/A\n${victimExtraPc*100}%\n${houseExtraPc*100}%`, inline: true},

        );
    void interaction.editReply({embeds: [embed]});
}

const name = 'info';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Get info about the steal command.');

export default { execute, name, subcommandBuilder };