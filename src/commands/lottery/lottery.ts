import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import auto from './subcommands/buy/auto';
import pick from './subcommands/buy/pick';
import check from './subcommands/check';
import info from './subcommands/info';

const subcommands = {
    [auto.name]: auto.execute,
    [pick.name]: pick.execute,
    [check.name]: check.execute,
    [info.name]: info.execute,
};

async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await subcommands[subcommand](interaction);
}

const name = 'lottery';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Buy lottery tickets or check your numbers.')
    .addSubcommandGroup(group => group
        .setName('buy')
        .setDescription('Buy lottery tickets.')
        .addSubcommand(pick.subcommandBuilder)
        .addSubcommand(auto.subcommandBuilder)
    )
    .addSubcommand(check.subcommandBuilder)
    .addSubcommand(info.subcommandBuilder);

export default { execute, name, commandBuilder };