import { ActionRowBuilder, ChatInputCommandInteraction, ComponentType, SlashCommandSubcommandBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction, StringSelectMenuOptionBuilder, bold } from 'discord.js';
import { timeInMS } from '../../../../util/util';
import { getABCharInventory } from '../../../../sql/tables/ab_inventory';
import { Weapon, WeaponId, getWeaponTooltip, weapons } from '../../../../autoBattler/Equipment/Weapons';
import { Shield, ShieldId, shields } from '../../../../autoBattler/Equipment/Shield';
import { EquipSlot, getABEquipment, updateABEquipment } from '../../../../sql/tables/ab_equipment';
import { getABSelectedChar } from '../../../../sql/tables/ab_characters';

async function execute(interaction: ChatInputCommandInteraction) {
    const reply = await interaction.deferReply({ephemeral: true});

    const user = interaction.user;

    const char = await getABSelectedChar(user.id);
    if (!char) {
        await interaction.editReply('You do not have a selected character.');
        return;
    }

    const equip = await getABEquipment(user.id, char.CHAR_NAME);
    if (!equip) {
        await interaction.editReply('You do not have equipment for your selected character.');
        return;
    }

    const inv = await getABCharInventory(user.id, char.CHAR_NAME);
    const mainHands: {[id: number]: Weapon} = {};
    const offHands: {[id: number]: Weapon|Shield} = {};
    for (const item of inv) {
        if (item.ITEM_ID in weapons) {
            const weapon = weapons[item.ITEM_ID as WeaponId];
            mainHands[item.ID] = weapon;
            if (weapon.twoHanded === false) {
                offHands[item.ID] = weapon;
            }
        }
        if (item.ITEM_ID in shields) {
            offHands[item.ID] = shields[item.ITEM_ID as ShieldId];
        }
    }

    // Main Hand select menu
    const mainHandSelectMenu = new StringSelectMenuBuilder()
        .setCustomId(EquipSlot.MainHand)
        .setPlaceholder('Main Hand is empty.');
    const mainHandEmptyOption = new StringSelectMenuOptionBuilder()
        .setLabel('Empty Main Hand')
        .setDescription('Empty slot')
        .setValue('NULL');
    if (!equip.MAIN_HAND) mainHandEmptyOption.setDefault(true);
    mainHandSelectMenu.addOptions(
        mainHandEmptyOption,
        ...Object.entries(mainHands).map(([id, weapon]) => {
            const option = new StringSelectMenuOptionBuilder()
                .setLabel(weapon.name)
                .setDescription(getWeaponTooltip(weapon).tooltip)
                .setValue(`${id}`);
            if (equip.MAIN_HAND && equip.MAIN_HAND === parseInt(id)) option.setDefault(true);
            return option;
        }));
    if (mainHandSelectMenu.options.length === 1) mainHandSelectMenu.setDisabled(true);

    // Off Hand select menu
    const offHandSelectMenu = new StringSelectMenuBuilder()
        .setCustomId(EquipSlot.OffHand)
        .setPlaceholder('Off Hand is empty.');
    const offHandEmptyOption = new StringSelectMenuOptionBuilder()
        .setLabel('Empty Off Hand')
        .setDescription('Empty slot')
        .setValue('NULL');
    if (!equip.OFF_HAND) offHandEmptyOption.setDefault(true);
    offHandSelectMenu.addOptions(
        offHandEmptyOption,
        ...Object.entries(offHands).map(([id, offHand]) => {
            const option = new StringSelectMenuOptionBuilder()
                .setLabel(offHand.name)
                .setDescription('description here')
                .setValue(`${id}`);
            if (equip.OFF_HAND && equip.OFF_HAND === parseInt(id)) option.setDefault(true);
            return option;
        }));
    if (offHandSelectMenu.options.length === 1) offHandSelectMenu.setDisabled(true);

    const components: ActionRowBuilder<StringSelectMenuBuilder>[] = [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(mainHandSelectMenu),
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(offHandSelectMenu)
    ];

    // TODO: change to if all slots are empty
    if (components.length === 0) {
        await interaction.editReply('You do not have equipment to swap to.');
        return;
    }
    await interaction.editReply({content: 'Swap your equipment.', components});

    const filter = (i: StringSelectMenuInteraction) => i.user.id === user.id;
    const collector = reply.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 1 * timeInMS.minute, filter });

    collector.on('collect', async i => {
        const id = i.values[0] !== 'NULL' ? parseInt(i.values[0]) : null;
        // TODO: unequip off hand if main hand is two-handed
        // TODO: check if weapon is already in use by other hand
        await updateABEquipment(user.id, char.CHAR_NAME, i.customId as EquipSlot, id);
        await Promise.all([
            i.reply({content: `${bold(i.customId)} swapped to ${bold(id ? mainHands[id].name : 'Empty')}.`, ephemeral: true}),
        ]);
    });

    collector.on('end', async () => {
        await reply.edit({content: 'Equipment swap expired.', components: []});
    });
}

const name = 'swap';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Swap equipment on your selected character.');

export default { execute, name, subcommandBuilder };