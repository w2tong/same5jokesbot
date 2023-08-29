import { APIApplicationCommandOptionChoice, ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder, userMention } from 'discord.js';
import { emptyEmbedFieldInline } from '../../../util/discordUtil';
import { ProfitType, getTopProfits, getTotalProfits } from '../../../sql/tables/profits';
import { capitalize } from '../../../util/util';
async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const type = interaction.options.getString('type') as ProfitType;

    const topProfits = await (type ? getTopProfits(type) : getTopProfits());
    const totalProfits = await (type ? getTotalProfits(type) : getTotalProfits());
    if (topProfits.length === 0 || !totalProfits) {
        await interaction.editReply(`There are no profits${type ? ` for ${capitalize(type)}` : ''}.`);
        return;
    }

    const users: string[] = [];
    const userProfits: string[] = [];
    for (const {USER_ID, PROFITS} of topProfits) {
        users.push(userMention(USER_ID));
        userProfits.push(PROFITS.toLocaleString());
    }

    const embed = new EmbedBuilder()
        .setTitle(`${type ? capitalize(type) : 'Total'} Profits`)
        .addFields(
            {name: 'Total Winnings', value: `${totalProfits.WINNINGS.toLocaleString()}`, inline: true},
            {name: 'Total Losses', value: `${totalProfits.LOSSES.toLocaleString()}`, inline: true},
            {name: 'Total Profits', value: `${totalProfits.PROFITS.toLocaleString()}`, inline: true},
            {name: 'Users', value: users.join('\n'), inline: true},
            emptyEmbedFieldInline,
            {name: 'Profits', value: userProfits.join('\n'), inline: true}
        );
    
    await interaction.editReply({embeds: [embed]});
}

const name = 'top';

const typeChoices: APIApplicationCommandOptionChoice<string>[] = [];
for (const type of Object.values(ProfitType)) {
    typeChoices.push({name: capitalize(type), value: type});
}

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Gets top total profits.')
    .addStringOption(option => option
        .setName('type')
        .setDescription('Choose the type of profit')
        .addChoices(...typeChoices)
    );

export default { execute, name, subcommandBuilder };