import { ActionRowBuilder, ChatInputCommandInteraction, ComponentType, SlashCommandSubcommandBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction, StringSelectMenuOptionBuilder, bold } from 'discord.js';
import { deleteABCharacter, getABPlayerCharacters } from '../../../../sql/tables/ab_characters';
import { nanoid } from 'nanoid';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ephemeral: true});

    const user = interaction.user;

    const chars = await getABPlayerCharacters(interaction.user.id);
    if (chars.length === 0) {
        await interaction.editReply('You don\'t have any characters to delete.');
        return;
    }

    const selectId = `delete-ab-char-${nanoid()}`;
    const select = new StringSelectMenuBuilder()
        .setCustomId(selectId)
        .setPlaceholder('Select a character to delete.')
        .addOptions(...chars.map(char => new StringSelectMenuOptionBuilder()
            .setLabel(char.CHAR_NAME)
            .setDescription(`Lvl. ${char.CHAR_LEVEL} ${char.CLASS_NAME}`)
            .setValue(char.CHAR_NAME)
        ));

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
    const res = await interaction.editReply({components: [row]});

    const filter = (i: StringSelectMenuInteraction) => i.customId === selectId && i.user.id === user.id;
    const collector = res.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60_000, filter });

    collector.on('collect', async i => {
        const name = i.values[0];
        await Promise.all([
            deleteABCharacter(interaction.user.id, name),
            i.reply(`${i.user} deleted character ${bold(name)}.`),
        ]);
        await interaction.deleteReply();
        collector.stop();
    });
}

const name = 'delete';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Delete a character.');

export default { execute, name, subcommandBuilder };