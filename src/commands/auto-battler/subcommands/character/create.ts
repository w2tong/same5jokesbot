import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder, bold, userMention } from 'discord.js';
import { ClassName, Classes } from '../../../../autoBattler/Classes/classes';
import { insertABCharacter } from '../../../../sql/tables/ab_characters';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const name = interaction.options.getString('name');
    const className = interaction.options.getString('class') as ClassName;
    if (!name || !className) {
        await interaction.editReply('There was an error creating your character.');
        return;
    }

    const success = await insertABCharacter(interaction.user.id, name, className);
    if (success) {
        await interaction.editReply(`${userMention(interaction.user.id)} created a new character ${bold(name)} (${className}).`);
    }
    else {
        await interaction.editReply(`This character name ${bold(name)} is already taken by you.`);
    }
}

const name = 'create';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Create your character.')
    .addStringOption(option => option
        .setName('name')
        .setDescription('Enter your character\'s name.')
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(32)
        
    )
    .addStringOption(option => option
        .setName('class')
        .setDescription('Select your class.')
        .setRequired(true)
        .addChoices(
            ...Object.keys(Classes).map(className => {return {name: className, value: className};})
        )
    );

export default { execute, name, subcommandBuilder };