import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder} from 'discord.js';
import { getABSelectedChar } from '../../../../sql/tables/ab_characters';
// import { getABEquipment } from '../../../../sql/tables/ab_equipment';
import { Classes } from '../../../../autoBattler/Classes/classes';
import { defaultEquipment, fetchEquipment } from '../../../../autoBattler/Equipment/Equipment';
import { ClassStats } from '../../../../autoBattler/statTemplates';
import { getWeaponTooltip } from '../../../../autoBattler/Equipment/Weapons';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const user = interaction.user;
    const char = await getABSelectedChar(user.id);

    if (!char) {
        await interaction.editReply('You do not have a selected character.');
        return;
    }
    
    const equipment = await fetchEquipment(user.id, char.CHAR_NAME);
    // Set main hand to class default if missing
    if (!equipment.mainHand) equipment.mainHand = defaultEquipment[char.CLASS_NAME].mainHand;
    const charInfo = new Classes[char.CLASS_NAME](char.CHAR_LEVEL, ClassStats[char.CLASS_NAME], equipment, char.CHAR_NAME, {userId: user.id}).info();

    const embed = new EmbedBuilder()
        .setAuthor({name: `${user.username} - ${charInfo.name}`, iconURL: user.displayAvatarURL()})
        .setTitle(`Lvl. ${charInfo.level} ${charInfo.className}`)
        .addFields(
            {name: 'Health', value: `${charInfo.health}`, inline: true},
            {name: 'Mana', value: `${charInfo.mana}`, inline: true},
            {name: 'Mana Regen', value: `${charInfo.manaRegen}`, inline: true},

            {name: 'Armour Class', value: `${charInfo.armourClass}`, inline: true},
            {name: 'Phys DR', value: `${charInfo.physDR}`, inline: true},
            {name: 'Magic DR', value: `${charInfo.magicDR}`, inline: true},

            {name: 'Initiative Bonus', value: `${charInfo.initiativeBonus}`, inline: true},
            {name: 'Phys Resist', value: `${charInfo.physResist}%`, inline: true},
            {name: 'Magic Resist', value: `${charInfo.magicResist}%`, inline: true},

            // TODO: update attack bonus to reflect dual-wield/offhand penalty
            {name: 'Main Hand Attack', value: getWeaponTooltip(charInfo.mainHand).tooltip}
        )
    ;

    if (charInfo.offHandWeapon) {
        embed.addFields({name: 'Off Hand Attack', value: getWeaponTooltip(charInfo.offHandWeapon).tooltip
        });
    }

    await interaction.editReply({embeds: [embed]});
}

const name = 'info';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Get info about your selected character.');

export default { execute, name, subcommandBuilder };