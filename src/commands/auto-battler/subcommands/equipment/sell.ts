import { ActionRowBuilder, ChatInputCommandInteraction, ComponentType, SlashCommandSubcommandBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction, StringSelectMenuOptionBuilder, bold } from 'discord.js';
import { deleteABInventoryItem, getABInventory } from '../../../../sql/tables/ab_inventory';
import { Equip, equips, getItemDescription } from '../../../../autoBattler/Equipment/Equipment';
import { timeInMS } from '../../../../util/util';
import { updateCringePoints } from '../../../../sql/tables/cringe_points';
import { SelectMenuOptionLimit } from '../../../../util/discordUtil';

async function execute(interaction: ChatInputCommandInteraction) {
    const reply = await interaction.deferReply({ephemeral: true});
    const user = interaction.user;

    const inv = await getABInventory(interaction.user.id);
    if (inv.length === 0) {
        await interaction.editReply('You don\'t have any items to sell.');
        return;
    }

    const itemOptions: {[id: number]: Equip} = {};
    for (const item of inv) {
        if (item.ITEM_ID in equips) itemOptions[item.ID] = equips[item.ITEM_ID];
        if (Object.keys(itemOptions).length >= SelectMenuOptionLimit) break;
    }
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('sell')
        .setPlaceholder('Select an item to sell.')
        .addOptions(
            ...Object.entries(itemOptions).map(([id, item]) => 
                new StringSelectMenuOptionBuilder()
                    .setLabel(item.name)
                    .setDescription(getItemDescription(item))
                    .setValue(id)
            )
        );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
    await interaction.editReply({components: [row]});

    const filter = (i: StringSelectMenuInteraction) => i.user.id === user.id;
    const collector = reply.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 1 * timeInMS.minute, filter });
    collector.on('collect', async i => {
        const itemId = i.values[0];
        const index = selectMenu.options.findIndex(option => option.data.value === itemId);
        const sellPrice = 1_000;
        selectMenu.spliceOptions(index, 1);
        await Promise.all([
            deleteABInventoryItem(user.id, itemId),
            updateCringePoints([{userId: i.user.id, points: sellPrice}])
        ]);
        if (selectMenu.options.length) {
            await i.update({components: [row]});
        }
        else {
            await i.update({content: 'You have no more items to sell.', components: []});
        }
        
        await i.followUp({content: `${bold(itemOptions[parseInt(itemId)].name)} sold for ${bold(sellPrice.toLocaleString())}.`, ephemeral: true});
    });

    collector.on('end', async () => {
        if (reply && !collector.lastCollectedTimestamp) await reply.delete();
    });
}

const name = 'sell';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Sell your items from you inventory.');

export default { execute, name, subcommandBuilder };