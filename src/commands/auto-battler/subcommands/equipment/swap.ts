import { ActionRowBuilder, ChatInputCommandInteraction, ComponentType, SlashCommandSubcommandBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction, StringSelectMenuOptionBuilder, bold } from 'discord.js';
import { timeInMS } from '../../../../util/util';
import { getABCharInventory } from '../../../../sql/tables/ab_inventory';
import { Weapon, WeaponId, getWeaponDescription, weapons } from '../../../../autoBattler/Equipment/Weapons';
import { Shield, ShieldId, getShieldDescription, shields } from '../../../../autoBattler/Equipment/Shield';
import { EquipSlot, getABEquipment, updateABEquipment } from '../../../../sql/tables/ab_equipment';
import { getABSelectedChar } from '../../../../sql/tables/ab_characters';
import { Armour, ArmourId, armour, getArmourDescription } from '../../../../autoBattler/Equipment/Armour';
import { ItemType } from '../../../../autoBattler/Equipment/Item';

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
    if (!equip.MAIN_HAND) mainHandEmptyOption.setDefault(true);
    mainHandSelectMenu.addOptions(
        mainHandEmptyOption,
        ...Object.entries(mainHandOptions).map(([id, weapon]) => {
            const option = new StringSelectMenuOptionBuilder()
                .setLabel(weapon.name)
                .setDescription(getWeaponDescription(weapon))
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
        ...Object.entries(offHandOptions).map(([id, offHand]) => {
            const option = new StringSelectMenuOptionBuilder()
                .setLabel(offHand.name)
                .setDescription(offHand.itemType === ItemType.Weapon ? getWeaponDescription(offHand) : getShieldDescription(offHand))
                .setValue(`${id}`);
            if (equip.OFF_HAND && equip.OFF_HAND === parseInt(id)) option.setDefault(true);
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
    if (!equip.ARMOUR) armourEmptyOption.setDefault(true);
    armourSelectMenu.addOptions(
        armourEmptyOption,
        ...Object.entries(armourOptions).map(([id, armour]) => {
            const option = new StringSelectMenuOptionBuilder()
                .setLabel(armour.name)
                .setDescription(getArmourDescription(armour))
                .setValue(`${id}`);
            if (equip.ARMOUR && equip.ARMOUR === parseInt(id)) option.setDefault(true);
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
        // TODO: unequip off hand if main hand is two-handed
        // TODO: check if weapon is already in use by other hand
        await updateABEquipment(user.id, char.CHAR_NAME, equipSlot, id);
        let itemName = 'Empty';
        if (id) {
            switch(equipSlot) {
                case EquipSlot.MainHand: 
                    itemName = mainHandOptions[id].name;
                    break;
                case EquipSlot.OffHand: 
                    itemName = offHandOptions[id].name;
                    break;
                case EquipSlot.Armour: 
                    itemName = armourOptions[id].name;
                    break;
            }
        }
        
        await Promise.all([
            i.reply({content: `${bold(i.customId)} swapped to ${bold(itemName)}.`, ephemeral: true}),
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