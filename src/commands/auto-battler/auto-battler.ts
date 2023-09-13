import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import pve from './subcommands/pve';
import pvp from './subcommands/pvp';

const subcommands = {
    [pve.name]: pve.execute,
    [pvp.name]: pvp.execute,
};

async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await subcommands[subcommand](interaction);
}

const name = 'auto-battler';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Create or interact with bets.')
    .addSubcommand(pve.subcommandBuilder)
    .addSubcommand(pvp.subcommandBuilder);

export default { execute, name, commandBuilder };