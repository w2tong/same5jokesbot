import { ActionRowBuilder, ChatInputCommandInteraction, ComponentType, SlashCommandSubcommandBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction, StringSelectMenuOptionBuilder, bold } from 'discord.js';
import { timeInMS } from '../../../../util/util';
import { getABCharInventory } from '../../../../sql/tables/ab_inventory';
import { Weapon, WeaponId, getWeaponDescription, weapons } from '../../../../autoBattler/Equipment/Weapons';
import { Shield, ShieldId, getShieldDescription, shields } from '../../../../autoBattler/Equipment/Shield';
import { EquipSlot, getABEquipment, updateABEquipment } from '../../../../sql/tables/ab_equipment';
import { getABSelectedChar } from '../../../../sql/tables/ab_characters';
import { Armour, ArmourId, armour, getArmourDescription } from '../../../../autoBattler/Equipment/Armour';
import { ItemType } from '../../../../autoBattler/Equipment/Item';
import { Equip } from '../../../../autoBattler/Equipment/Equipment';

async function execute(interaction: ChatInputCommandInteraction) {
    const reply = await interaction.deferReply({ephemeral: true});
    const user = interaction.user;

    const char = await getABSelectedChar(user.id);
    if (!char) {
        await interaction.editReply('You do not have a selected character.');
        return;
    }

    const equipment = await getABEquipment(user.id, char.CHAR_NAME);
    if (!equipment) {
        await interaction.editReply('You do not have equipment for your selected character.');
        return;
    }

    const inv = await getABCharInventory(user.id, char.CHAR_NAME);
    const mainHandOptions: {[id: number]: Weapon} = {};
    const offHandOptions: {[id: number]: Weapon|Shield} = {};
    const armourOptions: {[id: number]: Armour} = {};
    for (const item of inv) {
        if (item.ITEM_ID in weapons) {
            const weapon = weapons[item.ITEM_ID as WeaponId];
            mainHandOptions[item.ID] = weapon;
            if (weapon.twoHanded === false) {
                offHandOptions[item.ID] = weapon;
            }
        }
        else if (item.ITEM_ID in shields) {
            offHandOptions[item.ID] = shields[item.ITEM_ID as ShieldId];
        }
        else if (item.ITEM_ID in armour) {
            armourOptions[item.ID] = armour[item.ITEM_ID as ArmourId];
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
    if (!equipment.MAIN_HAND) mainHandEmptyOption.setDefault(true);
    mainHandSelectMenu.addOptions(
        mainHandEmptyOption,
        ...Object.entries(mainHandOptions).map(([id, weapon]) => {
            const option = new StringSelectMenuOptionBuilder()
                .setLabel(`${weapon.name} (${id})`)
                .setDescription(getWeaponDescription(weapon))
                .setValue(`${id}`);
            if (equipment.MAIN_HAND && equipment.MAIN_HAND === parseInt(id)) option.setDefault(true);
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
    if (!equipment.OFF_HAND) offHandEmptyOption.setDefault(true);
    offHandSelectMenu.addOptions(
        offHandEmptyOption,
        ...Object.entries(offHandOptions).map(([id, offHand]) => {
            const option = new StringSelectMenuOptionBuilder()
                .setLabel(`${offHand.name} (${id})`)
                .setDescription(offHand.itemType === ItemType.Weapon ? getWeaponDescription(offHand) : getShieldDescription(offHand))
                .setValue(`${id}`);
            if (equipment.OFF_HAND && equipment.OFF_HAND === parseInt(id)) option.setDefault(true);
            return option;
        }));
    if (offHandSelectMenu.options.length === 1) offHandSelectMenu.setDisabled(true);

    // Armour select menu
    const armourSelectMenu = new StringSelectMenuBuilder()
        .setCustomId(EquipSlot.Armour)
        .setPlaceholder('Armour is empty.');
    const armourEmptyOption = new StringSelectMenuOptionBuilder()
        .setLabel('Empty Armour')
        .setDescription('Empty slot')
        .setValue('NULL');
    if (!equipment.ARMOUR) armourEmptyOption.setDefault(true);
    armourSelectMenu.addOptions(
        armourEmptyOption,
        ...Object.entries(armourOptions).map(([id, armour]) => {
            const option = new StringSelectMenuOptionBuilder()
                .setLabel(armour.name)
                .setDescription(getArmourDescription(armour))
                .setValue(`${id}`);
            if (equipment.ARMOUR && equipment.ARMOUR === parseInt(id)) option.setDefault(true);
            return option;
        }));
    if (armourSelectMenu.options.length === 1) armourSelectMenu.setDisabled(true);

    const components: ActionRowBuilder<StringSelectMenuBuilder>[] = [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(mainHandSelectMenu),
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(offHandSelectMenu),
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(armourSelectMenu)
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
        const equipSlot = i.customId as EquipSlot;

        // Check if weapon is already in use by other hand
        if (id && equipSlot === EquipSlot.MainHand && id === equipment.OFF_HAND) {
            await i.reply({content: 'You cannot use the same weapon in both hands', ephemeral: true});
            return;
        }
        else if (id && equipSlot === EquipSlot.OffHand && id === equipment.MAIN_HAND) {
            await i.reply({content: 'You cannot use the same weapon in both hands', ephemeral: true});
            return;
        }

        await updateABEquipment(user.id, char.CHAR_NAME, equipSlot, id);
        // Update equipment object with id or null
        
        let equip: Equip|null = null;
        switch(equipSlot) {
            case EquipSlot.MainHand:
                equipment.MAIN_HAND = id;
                if (id) equip = mainHandOptions[id];
                break;
            case EquipSlot.OffHand:
                equipment.OFF_HAND = id;
                if (id) equip = offHandOptions[id];
                break;
            case EquipSlot.Armour:
                equipment.ARMOUR = id;
                if (id) equip = armourOptions[id];
                break;
        }

        const itemName = equip ? equip.name : 'Empty';
        const swapReplies = [`${bold(i.customId)} swapped to ${bold(itemName)}.`];
        
        // Unequip off hand if exists and main hand is two-handed
        if (equip && (equipSlot === EquipSlot.MainHand || equipSlot === EquipSlot.OffHand) && equipment.MAIN_HAND && mainHandOptions[equipment.MAIN_HAND].twoHanded) {
            // Unequip off hand
            if (equipSlot === EquipSlot.MainHand && equipment.OFF_HAND) {
                await updateABEquipment(user.id, char.CHAR_NAME, EquipSlot.OffHand, null);
                swapReplies.push(`${bold(EquipSlot.OffHand)} swapped to ${bold('Empty')}.`);
                equipment.OFF_HAND = null;
            }
            // Unequip main hand
            else if (equipSlot === EquipSlot.OffHand && equipment.MAIN_HAND) {
                await updateABEquipment(user.id, char.CHAR_NAME, EquipSlot.MainHand, null);
                swapReplies.push(`${bold(EquipSlot.MainHand)} swapped to ${bold('Empty')}.`);
                equipment.MAIN_HAND = null;
            }
        }
        
        await Promise.all([
            i.reply({content: swapReplies.join('\n'), ephemeral: true}),
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