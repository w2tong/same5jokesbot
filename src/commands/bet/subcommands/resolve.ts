import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { resolveBet, BetResult } from '../betManager';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const result = interaction.options.getString('result') as BetResult;
    if (result) {
        // add embed with wins and losses
        const reply = await resolveBet(interaction.user.id, result, interaction.client);
        void interaction.editReply(reply);
    }
    else {
        void interaction.editReply('Error receiving result input.');
    }
}

const name = 'resolve';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Resolve your current bet with Yes or No.')
    .addStringOption(option => option
        .setName('result')
        .setDescription('Select the result of the bet.')
        .setRequired(true)
        .addChoices(
            {name: 'Yes', value: BetResult.Yes},
            {name: 'No', value: BetResult.No}
        )
    );

export default { execute, name, subcommandBuilder };