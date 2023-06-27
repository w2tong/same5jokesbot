import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import breaks from './subcommands/breaks';
import currentStreak from './subcommands/current-streak';
import highscore from './subcommands/highscore';
import topBreaks from './subcommands/top-breaks';
import topRate from './subcommands/top-rate';

const subcommands = {
    [breaks.name]: breaks.execute,
    [currentStreak.name]: currentStreak.execute,
    [highscore.name]: highscore.execute,
    [topBreaks.name]: topBreaks.execute,
    [topRate.name]: topRate.execute,
};

async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await subcommands[subcommand](interaction);
}

const name = 'disperse';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Get users\' disperse info.')
    .addSubcommand(breaks.subcommandBuilder)
    .addSubcommand(currentStreak.subcommandBuilder)
    .addSubcommand(highscore.subcommandBuilder)
    .addSubcommand(topBreaks.subcommandBuilder)
    .addSubcommand(topRate.subcommandBuilder);

export default { execute, name, commandBuilder };