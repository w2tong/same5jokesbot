import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder, bold } from 'discord.js';
import { EquipSlot, getABEquipmentItemIds } from '../../../../sql/tables/ab_equipment';
import { getABSelectedChar } from '../../../../sql/tables/ab_characters';
import { equips, getItemTooltip } from '../../../../autoBattler/Equipment/Equipment';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const user = interaction.options.getUser('user') ?? interaction.user;

    const char = await getABSelectedChar(user.id);
    if (!char) {
        await interaction.editReply(`${user.username} does not have a selected character.`);
        return;
    }
    const equipmentIds = await getABEquipmentItemIds(user.id, char.CHAR_NAME);
    if (!equipmentIds) {
        await interaction.editReply('Could not retrieve character equipment.');
        return;
    }
    const embeds = [];
    if (equipmentIds.MAIN_HAND) {
        const item = equips[equipmentIds.MAIN_HAND];
        embeds.push(new EmbedBuilder()
            .setTitle(EquipSlot.MainHand)
            .addFields({name: item.name, value: getItemTooltip(item)})
        );
    }
    if (equipmentIds.OFF_HAND) {
        const item = equips[equipmentIds.OFF_HAND];
        embeds.push(new EmbedBuilder()
            .setTitle(EquipSlot.OffHand)
            .addFields({name: item.name, value: getItemTooltip(item)})
        );
    }
    if (equipmentIds.ARMOUR) {
        const item = equips[equipmentIds.ARMOUR];
        embeds.push(new EmbedBuilder()
            .setTitle(EquipSlot.Armour)
            .addFields({name: item.name, value: getItemTooltip(item)})
        );
    }
    if (equipmentIds.HEAD) {
        const item = equips[equipmentIds.HEAD];
        embeds.push(new EmbedBuilder()
            .setTitle(EquipSlot.Head)
            .addFields({name: item.name, value: getItemTooltip(item)})
        );
    }
    if (equipmentIds.HANDS) {
        const item = equips[equipmentIds.HANDS];
        embeds.push(new EmbedBuilder()
            .setTitle(EquipSlot.Hands)
            .addFields({name: item.name, value: getItemTooltip(item)})
        );
    }
    if (equipmentIds.RING1) {
        const item = equips[equipmentIds.RING1];
        embeds.push(new EmbedBuilder()
            .setTitle(EquipSlot.Ring1)
            .addFields({name: item.name, value: getItemTooltip(item)})
        );
    }
    if (equipmentIds.RING2) {
        const item = equips[equipmentIds.RING2];
        embeds.push(new EmbedBuilder()
            .setTitle(EquipSlot.Ring2)
            .addFields({name: item.name, value: getItemTooltip(item)})
        );
    }
    if (equipmentIds.POTION) {
        const item = equips[equipmentIds.POTION];
        embeds.push(new EmbedBuilder()
            .setTitle(EquipSlot.Potion)
            .addFields({name: item.name, value: getItemTooltip(item)})
        );
    }
    if (equipmentIds.BELT) {
        const item = equips[equipmentIds.BELT];
        embeds.push(new EmbedBuilder()
            .setTitle(EquipSlot.Belt)
            .addFields({name: item.name, value: getItemTooltip(item)})
        );
    }
    if (equipmentIds.AMULET) {
        const item = equips[equipmentIds.AMULET];
        embeds.push(new EmbedBuilder()
            .setTitle(EquipSlot.Amulet)
            .addFields({name: item.name, value: getItemTooltip(item)})
        );
    }

    if (!embeds.length) {
        await interaction.editReply(`${user.username}'s selected character does not have any equipment.`);
        return;
    }
    await interaction.editReply({content: `${user.username} - ${bold(char.CHAR_NAME)}'s Equipment`, embeds});
}

const name = 'display';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Display the equipment of your currently selected character.')
    .addUserOption(option => option
        .setName('user')
        .setDescription('Select a user.')
    );

export default { execute, name, subcommandBuilder };