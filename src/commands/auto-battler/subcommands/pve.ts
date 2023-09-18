import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import Battle from '../../../autoBattler/Battle';
import { ClassStats } from '../../../autoBattler/statTemplates';
import { timeInMS } from '../../../util/util';
import { getABPSelectedCharacter } from '../../../sql/tables/ab_characters';
import { Classes } from '../../../autoBattler/Classes/classes';
import { getRandomEncounter } from '../../../autoBattler/encounters';


async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const user = interaction.user;
    const userChar = await getABPSelectedCharacter(user.id);

    if (!userChar) {
        await interaction.editReply('You do not have a selected character.');
        return;
    }
    
    const battle = new Battle(
        [new Classes[userChar.CLASS_NAME](userChar.CHAR_LEVEL, ClassStats[userChar.CLASS_NAME], userChar.CHAR_NAME)],
        getRandomEncounter(1)
    );
    
    await interaction.editReply({embeds: [battle.generateEmbed()]});

    battle.startCombat();
    const interval = setInterval(() => {
        void (async () => {
            const res = battle.nextTurn();
            if (res.combatEnded) {
                clearInterval(interval);
                // const balanceEmbed = new EmbedBuilder().addFields;
                await interaction.editReply({embeds: [battle.generateEmbed()]});
            }
            else {
                await interaction.editReply({embeds: [battle.generateEmbed()]});
            }
        })();
    }, 1 * timeInMS.second);
}

const name = 'pve';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Auto Battler')
    .addIntegerOption(option => option
        .setName('wager')
        .setDescription('Enter a wager.')
        .setMinValue(1)
    );

export default { execute, name, subcommandBuilder };