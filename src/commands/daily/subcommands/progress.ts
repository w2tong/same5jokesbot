import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { currDailies, userDailies } from '../../../daily/dailyManager';
import dailies from '../../../daily/dailies';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    if (currDailies.size === 0) {
        await interaction.editReply('There are no daily quests today.');
        return;
    }
    
    const quests: string[] = [];
    const progress: string[] = [];
    const rewards: string[] = [];
    for (const dailyId of currDailies.values()) {
        const userDaily = userDailies[interaction.user.id][dailyId];
        quests.push(dailies[dailyId].description);
        progress.push(userDaily.completed ? '✅' : `${userDaily.progress.toLocaleString()}/${dailies[dailyId].maxProgress.toLocaleString()}`);
        rewards.push(`${dailies[dailyId].reward.toLocaleString()}`);
    }

    const embed = new EmbedBuilder()
        .setAuthor({name: `${interaction.user.username}'s Daily Progress`, iconURL: interaction.user.displayAvatarURL()})
        .addFields(
            {name: 'Quest', value: quests.join('\n'), inline: true},
            {name: 'Progress', value: progress.join('\n'), inline: true},
            {name: 'Reward', value: rewards.join('\n'), inline: true},
        );

    await interaction.editReply({embeds: [embed]});
}

const name = 'progress';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Check your progress on today\'s dailies.');

export default { execute, name, subcommandBuilder };