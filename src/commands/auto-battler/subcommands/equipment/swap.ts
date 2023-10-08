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
import { Potion, PotionId, potions } from '../../../../autoBattler/Equipment/Potion';
import { Belt, BeltId, belts } from '../../../../autoBattler/Equipment/Belt';

const SwapSelectMenuOptionLimit = SelectMenuOptionLimit-1;

function createItemSelectMenuOption(equipSlot: EquipSlot, id: number|string, equip: Equip): StringSelectMenuOptionBuilder {
    return new StringSelectMenuOptionBuilder()
        .setLabel(`${equip.name}${equipSlot === EquipSlot.MainHand || equipSlot === EquipSlot.OffHand || equipSlot === EquipSlot.Ring1 || equipSlot === EquipSlot.Ring2 ? ` (id: ${id})` : ''}`)
        .setDescription(getItemDescription(equip))
        .setValue(`${id}`);
}

function createItemSelectMenu(equipSlot: EquipSlot, equippedId: number|null, equipOptions: {[id: number]: Equip}) {
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(equipSlot)
        .setPlaceholder(`${equipSlot} is empty.`);
    const emptyOption = new StringSelectMenuOptionBuilder()
        .setLabel(`Empty ${equipSlot}`)
        .setValue('NULL');
    if (!equippedId) emptyOption.setDefault(true);
    selectMenu.addOptions(emptyOption);
    if (equippedId) {
        const equip = equipOptions[equippedId];
        selectMenu.addOptions(createItemSelectMenuOption(equipSlot, equippedId, equip).setDefault(true));
    }
    selectMenu.addOptions (
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ...Object.entries(equipOptions).filter(([id, _equip]) => id !== equippedId?.toString()).reverse().slice(0, SwapSelectMenuOptionLimit - (equippedId ? 1 : 0)).map(([id, equip]) =>
            createItemSelectMenuOption(equipSlot, parseInt(id), equip)
        ));
    if (selectMenu.options.length === 1) selectMenu.setDisabled(true);
    return selectMenu;
}

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ephemeral: true});
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
    const potionOptions: {[id: number]: Potion} = {};
    const beltOptions: {[id: number]: Belt} = {};

    for (const item of inv.reverse()) {
        if (item.ITEM_ID in weapons) {
            const weapon = weapons[item.ITEM_ID as WeaponId];
            mainHandOptions[item.ID] = weapon;
            if (!weapon.twoHanded && weapon.light) {
                offHandOptions[item.ID] = weapon;
            }
        }
        else if (item.ITEM_ID in shields) {
            offHandOptions[item.ID] = shields[item.ITEM_ID as ShieldId];
        }
        else if (item.ITEM_ID in armour) {
            armourOptions[item.ID] = armour[item.ITEM_ID as ArmourId];
        }
        else if (item.ITEM_ID in heads) {
            headOptions[item.ID] = heads[item.ITEM_ID as HeadId];
        }
        else if (item.ITEM_ID in hands) {
            handsOptions[item.ID] = hands[item.ITEM_ID as HandsId];
        }
        else if (item.ITEM_ID in rings) {
            ringOptions[item.ID] = rings[item.ITEM_ID as RingId];
        }
        else if (item.ITEM_ID in potions) {
            potionOptions[item.ID] = potions[item.ITEM_ID as PotionId];
        }
        else if (item.ITEM_ID in belts) {
            beltOptions[item.ID] = belts[item.ITEM_ID as BeltId];
        }
    }

    const mainHandSelectMenu = createItemSelectMenu(EquipSlot.MainHand, equipment.MAIN_HAND, mainHandOptions);
    const offHandSelectMenu = createItemSelectMenu(EquipSlot.OffHand, equipment.OFF_HAND, offHandOptions);
    const armourSelectMenu = createItemSelectMenu(EquipSlot.Armour, equipment.ARMOUR, armourOptions);
    const headSelectMenu = createItemSelectMenu(EquipSlot.Head, equipment.HEAD, headOptions);
    const handsSelectMenu = createItemSelectMenu(EquipSlot.Hands, equipment.HANDS, handsOptions);

    const ring1SelectMenu = createItemSelectMenu(EquipSlot.Ring1, equipment.RING1, ringOptions);
    const ring2SelectMenu = createItemSelectMenu(EquipSlot.Ring2, equipment.RING2, ringOptions);
    const potionSelectMenu = createItemSelectMenu(EquipSlot.Potion, equipment.POTION, potionOptions);
    const beltSelectMenu = createItemSelectMenu(EquipSlot.Belt, equipment.BELT, beltOptions);

    const reply = await user.send({content: `Swap ${bold(char.CHAR_NAME)}'s equipment.`, components: [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(mainHandSelectMenu),
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(offHandSelectMenu),
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(armourSelectMenu),
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(headSelectMenu),
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(handsSelectMenu)   
    ]});
    await interaction.editReply(`Swap ${bold(char.CHAR_NAME)}'s equipment: ${reply.url}.`);

    const filter = (i: StringSelectMenuInteraction) => i.user.id === user.id;
    const collector1 = reply.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 1 * timeInMS.minute, filter });
    collector1.on('collect', async i => {
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

    collector1.on('end', async () => {
        try {
            await reply.delete();
        } catch {
            //
        }
    });

    // 2nd reply
    const reply2 = await reply.reply({components: [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(ring1SelectMenu),
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(ring2SelectMenu),
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(potionSelectMenu),
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(beltSelectMenu),
    ]});
    const collector2 = reply2.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 1 * timeInMS.minute, filter });
    collector2.on('collect', async i => {
        const id = i.values[0] !== 'NULL' ? parseInt(i.values[0]) : null;
        const equipSlot = i.customId as EquipSlot;

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
            case EquipSlot.Ring1:
                equipment.RING1 = id;
                if (id) equip = ringOptions[id];
                break;
            case EquipSlot.Ring2:
                equipment.RING2 = id;
                if (id) equip = ringOptions[id];
                break;
            case EquipSlot.Potion:
                equipment.POTION = id;
                if (id) equip = potionOptions[id];
                break;
            case EquipSlot.Belt:
                equipment.BELT = id;
                if (id) equip = beltOptions[id];
                break;
        }

        const itemName = equip ? equip.name : 'Empty';
        const swapReplies = [`${bold(i.customId)} swapped to ${bold(itemName)}.`];

        await i.reply({content: swapReplies.join('\n'), ephemeral: true});
    });

    collector2.on('end', async () => {
        try {
            await reply2.delete();
        } catch {
            //
        }
    });
}

const name = 'swap';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Swap equipment on your selected character.');

export default { execute, name, subcommandBuilder };