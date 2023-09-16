import { ActionRowBuilder, ChatInputCommandInteraction, ComponentType, SlashCommandSubcommandBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction, StringSelectMenuOptionBuilder, bold } from 'discord.js';
import { selectABCharacter, getABPlayerCharacters } from '../../../../sql/tables/ab_characters';
import { timeInMS } from '../../../../util/util';

async function execute(interaction: ChatInputCommandInteraction) {
    const reply = await interaction.deferReply();

    const user = interaction.user;

    const chars = await getABPlayerCharacters(interaction.user.id);
    if (chars.length === 0) {
        await interaction.editReply('You don\'t have any characters to select.');
        return;
    }

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select')
        .setPlaceholder('Select a character for combat.')
        .addOptions(...chars.map(char => new StringSelectMenuOptionBuilder()
            .setLabel(char.CHAR_NAME)
            .setDescription(`Lvl. ${char.CHAR_LEVEL} ${char.CLASS_NAME}`)
            .setValue(char.CHAR_NAME)
        ));

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
    await interaction.editReply({components: [row]});

    const filter = (i: StringSelectMenuInteraction) => i.user.id === user.id;
    const collector = reply.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 1 * timeInMS.minute, filter });

    collector.on('collect', async i => {
        const name = i.values[0];
        await Promise.all([
            selectABCharacter(i.user.id, name),
            i.reply(`${i.user} selected character ${bold(name)}.`),
        ]);
    });

    collector.on('end', async () => {
        await reply.delete();
    });
}

const name = 'select';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Select a character.');

export default { execute, name, subcommandBuilder };