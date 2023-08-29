import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { currDailies, userDailies } from '../daily/dailyManager';
import dailies from '../daily/dailies';

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    
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
        .setTitle(`${interaction.user.username}'s Daily Progress`)
        .addFields(
            {name: 'Quest', value: quests.join('\n'), inline: true},
            {name: 'Progress', value: progress.join('\n'), inline: true},
            {name: 'Reward', value: rewards.join('\n'), inline: true},
        );

    await interaction.editReply({embeds: [embed]});
}

const name = 'daily';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Check your progress on today\'s dailies.');

export default { execute, name, commandBuilder };