import { ActionRowBuilder, ChatInputCommandInteraction, ComponentType, SlashCommandSubcommandBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction, StringSelectMenuOptionBuilder, bold } from 'discord.js';
import { deleteABChar, getABPlayerChars } from '../../../../sql/tables/ab_characters';
import { timeInMS } from '../../../../util/util';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const user = interaction.user;

    const chars = await getABPlayerChars(interaction.user.id);
    if (chars.length === 0) {
        await interaction.editReply('You don\'t have any characters to delete.');
        return;
    }

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('delete')
        .setPlaceholder('Select a character to delete.')
        .addOptions(...chars.map(char => new StringSelectMenuOptionBuilder()
            .setLabel(char.CHAR_NAME)
            .setDescription(`Lvl. ${char.CHAR_LEVEL} ${char.CLASS_NAME}`)
            .setValue(char.CHAR_NAME)
        ));

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
    const reply = await interaction.editReply({components: [row]});

    const filter = (i: StringSelectMenuInteraction) => i.user.id === user.id;
    const collector = reply.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 1 * timeInMS.minute, filter });
    collector.on('collect', async i => {
        const name = i.values[0];
        await Promise.all([
            deleteABChar(i.user.id, name),
            i.update({content: `${i.user} deleted character ${bold(name)}.`, components: []}),
        ]);
        collector.stop();
    });

    collector.on('end', async () => {
        if (!collector.lastCollectedTimestamp) await reply.delete();
    });
}

const name = 'delete';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Delete a character.');

export default { execute, name, subcommandBuilder };