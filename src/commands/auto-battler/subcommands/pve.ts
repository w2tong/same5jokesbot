import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import Battle, { Side } from '../../../autoBattler/Battle';
import { ClassStats } from '../../../autoBattler/templates';
import { timeInMS } from '../../../util/util';
import Fighter from '../../../autoBattler/Classes/Fighter';
import { getABPSelectedCharacter } from '../../../sql/tables/ab_characters';
import { Classes } from '../../../autoBattler/Classes/classes';


async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const player = await getABPSelectedCharacter(interaction.user.id);

    if (!player) {
        await interaction.editReply('You do not have a selected character.');
        return;
    }
    
    const battle = new Battle();

    const playerChar = new Classes[player.CLASS_NAME](ClassStats[player.CLASS_NAME], player.CHAR_NAME, 0, Side.Left, battle, interaction.user.id);
    const left = [
        playerChar
    ];
    const right = [
        new Fighter(ClassStats.Fighter, 'Fighter NPC', 0, Side.Right, battle),
    ];

    battle.addChars(left, right);
    
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
    }, 0.5 * timeInMS.second);
}

const name = 'pve';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Auto Battler')
    .addIntegerOption(option => option
        .setName('wager')
        .setDescription('Enter a wager.')
        .setMinValue(1)
        .setRequired(false)
    );

export default { execute, name, subcommandBuilder };