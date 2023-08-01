import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import daily from './subcommands/daily';
import info from './subcommands/info';

const subcommands = {
    [daily.name]: daily.execute,
    [info.name]: info.execute,
};

async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await subcommands[subcommand](interaction);
}

const name = 'tax';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Get info about taxes.')
    .addSubcommand(daily.subcommandBuilder)
    .addSubcommand(info.subcommandBuilder);

export default { execute, name, commandBuilder };