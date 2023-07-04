import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import buy from './subcommands/buy';
import check from './subcommands/check';

const subcommands = {
    [buy.name]: buy.execute,
    [check.name]: check.execute,
};

async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await subcommands[subcommand](interaction);
}

const name = 'lottery';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Buy lottery tickets or check your numbers.')
    .addSubcommand(buy.subcommandBuilder)
    .addSubcommand(check.subcommandBuilder);

export default { execute, name, commandBuilder };