import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import pve from './subcommands/pve';
import pvp from './subcommands/pvp';
import createCharacter from './subcommands/character/create';
import deleteCharacter from './subcommands/character/delete';
import selectCharacter from './subcommands/character/select';
import characterInfo from './subcommands/character/info';
import equipmentSwap from './subcommands/equipment/swap';
import equipmentSell from './subcommands/equipment/sell';

const subcommands = {
    [pve.name]: pve.execute,
    [pvp.name]: pvp.execute,
    [createCharacter.name]: createCharacter.execute,
    [deleteCharacter.name]: deleteCharacter.execute,
    [selectCharacter.name]: selectCharacter.execute,
    [characterInfo.name]: characterInfo.execute,
    [equipmentSwap.name]: equipmentSwap.execute,
    [equipmentSell.name]: equipmentSell.execute,
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
        .addSubcommand(selectCharacter.subcommandBuilder)
        .addSubcommand(characterInfo.subcommandBuilder)
    )
    .addSubcommandGroup(group => group
        .setName('equipment')
        .setDescription('Equipment stuff')
        .addSubcommand(equipmentSwap.subcommandBuilder)
        .addSubcommand(equipmentSell.subcommandBuilder)
    );

export default { execute, name, commandBuilder };