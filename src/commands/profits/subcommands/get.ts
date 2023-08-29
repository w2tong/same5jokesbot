import { APIApplicationCommandOptionChoice, ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder, userMention } from 'discord.js';
import { emptyEmbedFieldInline } from '../../../util/discordUtil';
import { ProfitType, getUserAllProfits, getUserTypeProfits } from '../../../sql/tables/profits';
import { capitalize } from '../../../util/util';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const user = interaction.options.getUser('user') ?? interaction.user;
    const type = interaction.options.getString('type') as ProfitType;

    if (type) {
        const profits = await getUserTypeProfits(user.id, type);
        if (profits) {
            const embed = new EmbedBuilder()
                .setTitle(`${user.username}'s ${type ? `${capitalize(type)} ` : ''}Profits`)
                .addFields(
                    {name: 'Winnings', value: `${profits.WINNINGS.toLocaleString()}`, inline: true},
                    {name: 'Losses', value: `${profits.LOSSES.toLocaleString()}`, inline: true},
                    {name: 'Profits', value: `${profits.PROFITS.toLocaleString()}`, inline: true}
                );
            await interaction.editReply({embeds: [embed]});
        }
        else {
            await interaction.editReply(`You do not have profits for ${capitalize(type)}.`);
        }
    }
    else {
        const profits = await getUserAllProfits(user.id);
        let totalProfits = 0;
        const types: string[] = [];
        const profitsPerType: string[] = [];

        if (profits.length > 0) {
            for (const {TYPE, PROFITS} of profits) {
                totalProfits += PROFITS;
                types.push(capitalize(TYPE));
                profitsPerType.push(PROFITS.toLocaleString());
            }
            const embed = new EmbedBuilder()
                .setTitle(`${user.username}'s ${type ? `${capitalize(type)} ` : ''}Profits`)
                .addFields(
                    {name: 'User', value: userMention(user.id), inline: true},
                    {name: 'Total Profits', value: totalProfits.toLocaleString(), inline: true},
                    emptyEmbedFieldInline,
    
                    {name: 'Type', value: types.join('\n'), inline: true},
                    {name: 'Profits', value: profitsPerType.join('\n'), inline: true},
                    emptyEmbedFieldInline
                );
            await interaction.editReply({embeds: [embed]});
        }
        else {
            await interaction.editReply('You do not have profits.');
        }
    }
}

const name = 'get';

const typeChoices: APIApplicationCommandOptionChoice<string>[] = [];
for (const type of Object.values(ProfitType)) {
    typeChoices.push({name: capitalize(type), value: type});
}

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Gets a user\'s total profits.')
    .addUserOption(option => option
        .setName('user')
        .setDescription('Select a user')
    )
    .addStringOption(option => option
        .setName('type')
        .setDescription('Choose the type of profit')
        .addChoices(...typeChoices)
    );

export default { execute, name, subcommandBuilder };