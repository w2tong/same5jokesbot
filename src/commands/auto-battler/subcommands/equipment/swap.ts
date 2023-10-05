import { ActionRowBuilder, ChatInputCommandInteraction, ComponentType, SlashCommandSubcommandBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction, StringSelectMenuOptionBuilder, bold } from 'discord.js';
import { timeInMS } from '../../../../util/util';
import { getABCharInventory } from '../../../../sql/tables/ab_inventory';
import { Weapon, WeaponId, weapons } from '../../../../autoBattler/Equipment/Weapons';
import { Shield, ShieldId, shields } from '../../../../autoBattler/Equipment/Shield';
import { EquipSlot, getABEquipment, updateABEquipment } from '../../../../sql/tables/ab_equipment';
import { getABSelectedChar } from '../../../../sql/tables/ab_characters';
import { Armour, ArmourId, armour } from '../../../../autoBattler/Equipment/Armour';
import { Equip, getItemDescription } from '../../../../autoBattler/Equipment/Equipment';
import { Head, HeadId, heads } from '../../../../autoBattler/Equipment/Head';
import { Hands, HandsId, hands } from '../../../../autoBattler/Equipment/Hands';
import { SelectMenuOptionLimit } from '../../../../util/discordUtil';
import { Ring, RingId, rings } from '../../../../autoBattler/Equipment/Ring';

const SwapSelectMenuOptionLimit = SelectMenuOptionLimit-1;

function createItemSelectMenu(equipSlot: EquipSlot, equippedId: number|null, equipOptions: {[id: number]: Equip}) {
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(equipSlot)
        .setPlaceholder('Main Hand is empty.');
    const emptyOption = new StringSelectMenuOptionBuilder()
        .setLabel(`Empty ${equipSlot}`)
        .setDescription('Empty slot')
        .setValue('NULL');
    if (!equippedId) emptyOption.setDefault(true);
    selectMenu.addOptions(
        emptyOption,
        ...Object.entries(equipOptions).map(([id, equip]) => {
            const option = new StringSelectMenuOptionBuilder()
                .setLabel(`${equip.name}${equipSlot === EquipSlot.MainHand || equipSlot === EquipSlot.OffHand || equipSlot === EquipSlot.Ring1 || equipSlot === EquipSlot.Ring2 ? ` (id: ${id})` : ''}`)
                .setDescription(getItemDescription(equip))
                .setValue(`${id}`);
            if (equippedId && equippedId === parseInt(id)) option.setDefault(true);
            return option;
        }));
    if (selectMenu.options.length === 1) selectMenu.setDisabled(true);
    return selectMenu;
}

async function execute(interaction: ChatInputCommandInteraction) {
    const reply = await interaction.deferReply();
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

    // TODO: change to if all slots are empty
    if (inv.length === 0) {
        await interaction.editReply('You do not have equipment to swap to.');
        return;
    }

    const mainHandOptions: {[id: number]: Weapon} = {};
    const offHandOptions: {[id: number]: Weapon|Shield} = {};
    const armourOptions: {[id: number]: Armour} = {};
    const headOptions: {[id: number]: Head} = {};
    const handsOptions: {[id: number]: Hands} = {};
    const ringOptions: {[id: number]: Ring} = {};
    for (const item of inv) {
        if (item.ITEM_ID in weapons) {
            const weapon = weapons[item.ITEM_ID as WeaponId];
            if (Object.keys(mainHandOptions).length < SwapSelectMenuOptionLimit) mainHandOptions[item.ID] = weapon;
            if (weapon.twoHanded === false && Object.keys(offHandOptions).length < SwapSelectMenuOptionLimit) {
                offHandOptions[item.ID] = weapon;
            }
        }
        else if (item.ITEM_ID in shields && Object.keys(offHandOptions).length < SwapSelectMenuOptionLimit) {
            offHandOptions[item.ID] = shields[item.ITEM_ID as ShieldId];
        }
        else if (item.ITEM_ID in armour && Object.keys(armourOptions).length < SwapSelectMenuOptionLimit) {
            armourOptions[item.ID] = armour[item.ITEM_ID as ArmourId];
        }
        else if (item.ITEM_ID in heads && Object.keys(headOptions).length < SwapSelectMenuOptionLimit) {
            headOptions[item.ID] = heads[item.ITEM_ID as HeadId];
        }
        else if (item.ITEM_ID in hands && Object.keys(handsOptions).length < SwapSelectMenuOptionLimit) {
            handsOptions[item.ID] = hands[item.ITEM_ID as HandsId];
        }
        else if (item.ITEM_ID in rings && Object.keys(ringOptions).length < SwapSelectMenuOptionLimit) {
            ringOptions[item.ID] = rings[item.ITEM_ID as RingId];
        }
    }

    const mainHandSelectMenu = createItemSelectMenu(EquipSlot.MainHand, equipment.MAIN_HAND, mainHandOptions);
    const offHandSelectMenu = createItemSelectMenu(EquipSlot.OffHand, equipment.OFF_HAND, offHandOptions);
    const armourSelectMenu = createItemSelectMenu(EquipSlot.Armour, equipment.ARMOUR, armourOptions);
    const headSelectMenu = createItemSelectMenu(EquipSlot.Head, equipment.HEAD, headOptions);
    const handsSelectMenu = createItemSelectMenu(EquipSlot.Hands, equipment.HANDS, handsOptions);

    await interaction.editReply({content: 'Swap your equipment.', components: [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(mainHandSelectMenu),
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(offHandSelectMenu),
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(armourSelectMenu),
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(headSelectMenu),
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(handsSelectMenu)   
    ]});

    // 2nd reply
    const ring1SelectMenu = createItemSelectMenu(EquipSlot.Ring1, equipment.RING1, ringOptions);
    const ring2SelectMenu = createItemSelectMenu(EquipSlot.Ring2, equipment.RING2, ringOptions);

    const followUp = await interaction.followUp({components: [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(ring1SelectMenu),
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(ring2SelectMenu),
    ]});

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

        // Check if ring is already in use by other hand
        if (id && equipSlot === EquipSlot.Ring1 && id === equipment.RING2) {
            await i.reply({content: 'You cannot use the same ring in both slots.', ephemeral: true});
            return;
        }
        else if (id && equipSlot === EquipSlot.Ring2 && id === equipment.RING1) {
            await i.reply({content: 'You cannot use the same ring in both slots.', ephemeral: true});
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
            case EquipSlot.Head:
                equipment.HEAD = id;
                if (id) equip = headOptions[id];
                break;
            case EquipSlot.Hands:
                equipment.HANDS = id;
                if (id) equip = handsOptions[id];
                break;
            case EquipSlot.Ring1:
                equipment.RING1 = id;
                if (id) equip = ringOptions[id];
                break;
            case EquipSlot.Ring2:
                equipment.RING2 = id;
                if (id) equip = ringOptions[id];
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

        await i.reply({content: swapReplies.join('\n'), ephemeral: true});
    });

    collector.on('end', async () => {
        await reply.edit({content: 'Equipment swap expired.', components: []});
        await followUp.delete();
    });
}

const name = 'swap';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Swap equipment on your selected character.');

export default { execute, name, subcommandBuilder };