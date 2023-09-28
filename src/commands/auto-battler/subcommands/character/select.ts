import { ActionRowBuilder, ChatInputCommandInteraction, ComponentType, SlashCommandSubcommandBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction, StringSelectMenuOptionBuilder, bold } from 'discord.js';
import { selectABChar, getABPlayerChars } from '../../../../sql/tables/ab_characters';
import { timeInMS } from '../../../../util/util';

async function execute(interaction: ChatInputCommandInteraction) {
    const reply = await interaction.deferReply({ephemeral: true});

    const user = interaction.user;

    const chars = await getABPlayerChars(interaction.user.id);
    if (chars.length === 0) {
        await interaction.editReply('You don\'t have any characters to select.');
        return;
    }

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select')
        .setPlaceholder('Select a character for combat.')
        .addOptions(...chars.map(char => {
            const option = new StringSelectMenuOptionBuilder()
                .setLabel(char.CHAR_NAME)
                .setDescription(`Lvl. ${char.CHAR_LEVEL} ${char.CLASS_NAME}`)
                .setValue(char.CHAR_NAME);
            if (char.SELECTED) {
                option.setDefault(true);
            }
            return option;
        }));

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
    await interaction.editReply({components: [row]});

    const filter = (i: StringSelectMenuInteraction) => i.user.id === user.id;
    const collector = reply.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 1 * timeInMS.minute, filter });

    collector.on('collect', async i => {
        const name = i.values[0];
        await Promise.all([
            selectABChar(i.user.id, name),
            i.reply({content: `You selected character ${bold(name)}.`, ephemeral: true}),
        ]);
    });

    collector.on('end', async () => {
        await reply.edit({content: 'Character selection expired.', components: []});
    });
}

const name = 'select';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Select a character.');

export default { execute, name, subcommandBuilder };