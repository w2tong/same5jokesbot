import { ActionRowBuilder, ChatInputCommandInteraction, ComponentType, SlashCommandSubcommandBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction, StringSelectMenuOptionBuilder, bold } from 'discord.js';
import { selectABCharacter, getABPlayerCharacters } from '../../../../sql/tables/ab_characters';
import { nanoid } from 'nanoid';
import { timeInMS } from '../../../../util/util';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ephemeral: true});

    const user = interaction.user;

    const chars = await getABPlayerCharacters(interaction.user.id);
    if (chars.length === 0) {
        await interaction.editReply('You don\'t have any characters to select.');
        return;
    }

    const selectId = `select-ab-char-${nanoid()}`;
    const select = new StringSelectMenuBuilder()
        .setCustomId(selectId)
        .setPlaceholder('Select a character.')
        .addOptions(...chars.map(char => new StringSelectMenuOptionBuilder()
            .setLabel(char.CHAR_NAME)
            .setDescription(`Lvl. ${char.CHAR_LEVEL} ${char.CLASS_NAME}`)
            .setValue(char.CHAR_NAME)
        ));

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
    const res = await interaction.editReply({components: [row]});

    const filter = (i: StringSelectMenuInteraction) => i.customId === selectId && i.user.id === user.id;
    const collector = res.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 1 * timeInMS.minute, filter });

    collector.on('collect', async i => {
        const name = i.values[0];
        await Promise.all([
            selectABCharacter(interaction.user.id, name),
            i.reply(`${i.user} selected character ${bold(name)}.`),
        ]);
    });

    collector.on('end', async () => {
        await interaction.deleteReply();
    });
}

const name = 'select';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Select a character.');

export default { execute, name, subcommandBuilder };