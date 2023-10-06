import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder} from 'discord.js';
import { getABSelectedChar } from '../../../../sql/tables/ab_characters';
import { getWeaponTooltip } from '../../../../autoBattler/Equipment/Weapons';
import { createPlayerChar } from '../../../../autoBattler/util';
import { emptyEmbedFieldInline } from '../../../../util/discordUtil';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const user = interaction.user;
    const char = await getABSelectedChar(user.id);

    if (!char) {
        await interaction.editReply('You do not have a selected character.');
        return;
    }
    
    const charInfo = (await createPlayerChar(user.id, char)).info();

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

            {name: 'Thorns', value: `${charInfo.thorns}`, inline: true},
            {name: 'Mana Cost Reduction', value: `${charInfo.manaCostReduction}`, inline: true},
            emptyEmbedFieldInline,

            {name: 'Main Hand Attack', value: getWeaponTooltip(charInfo.mainHand)}
        )
    ;

    if (charInfo.offHandWeapon) {
        embed.addFields({name: 'Off Hand Attack', value: getWeaponTooltip(charInfo.offHandWeapon)
        });
    }

    await interaction.editReply({embeds: [embed]});
}

const name = 'info';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Get info about your selected character.');

export default { execute, name, subcommandBuilder };