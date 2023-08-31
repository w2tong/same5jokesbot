import { APIApplicationCommandOptionChoice, ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder, userMention } from 'discord.js';
import { MessageEmbedLimit, UsersPerEmbed, emptyEmbedFieldInline } from '../../../util/discordUtil';
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

    const embeds: EmbedBuilder[] = [];
    for (let i = 0; i < users.length; i += UsersPerEmbed) {
        const embed = new EmbedBuilder();
        if (i === 0) {
            embed
                .setTitle(`${type ? capitalize(type) : 'Total'} Profits`)
                .addFields(
                    // {name: 'Total Winnings', value: `${totalProfits.WINNINGS.toLocaleString()}`, inline: true},
                    // {name: 'Total Losses', value: `${totalProfits.LOSSES.toLocaleString()}`, inline: true},
                    emptyEmbedFieldInline,
                    emptyEmbedFieldInline,
                    {name: 'Total Profits', value: `${totalProfits.PROFITS.toLocaleString()}`, inline: true}
                );
        }
        const endRange = i + UsersPerEmbed;
        embed
            .addFields(
                {name: 'Users', value: users.slice(i, endRange).join('\n'), inline: true},
                emptyEmbedFieldInline,
                {name: 'Profits', value: userProfits.slice(i, endRange).join('\n'), inline: true}
            );
        embeds.push(embed);
    }

    for (let i = 0; i < embeds.length; i += MessageEmbedLimit) {
        if (i === 0) {
            await interaction.editReply({ embeds: embeds.slice(i, i + MessageEmbedLimit) });
        }
        else {
            await interaction.followUp({ embeds: embeds.slice(i, i + MessageEmbedLimit) });
        }
    }
}

const name = 'top';

const typeChoices: APIApplicationCommandOptionChoice<string>[] = [];
for (const type of Object.values(ProfitType)) {
    typeChoices.push({name: capitalize(type), value: type});
}

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Gets top total profits (top with no type exlcudes income).')
    .addStringOption(option => option
        .setName('type')
        .setDescription('Choose the type of profit')
        .addChoices(...typeChoices)
    );

export default { execute, name, subcommandBuilder };