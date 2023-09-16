import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import pve from './subcommands/pve';
import pvp from './subcommands/pvp';
import createCharacter from './subcommands/character/create';
import deleteCharacter from './subcommands/character/delete';

const subcommands = {
    [pve.name]: pve.execute,
    [pvp.name]: pvp.execute,
    [createCharacter.name]: createCharacter.execute,
    [deleteCharacter.name]: deleteCharacter.execute,
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
    .addSubcommand(pvp.subcommandBuilder)
    .addSubcommandGroup(group => group
        .setName('character')
        .setDescription('Character stuff.')
        .addSubcommand(createCharacter.subcommandBuilder)
        .addSubcommand(deleteCharacter.subcommandBuilder)
    );

export default { execute, name, commandBuilder };