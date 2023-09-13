import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import Character from '../../../autoBattler/Character';
import Battle, { Side } from '../../../autoBattler/Battle';
import { fighterStats, ratStats } from '../../../autoBattler/templates';
import { timeInMS } from '../../../util/util';
import Fighter from '../../../autoBattler/Classes/Fighter';


async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const battle = new Battle();
    const left = [
        new Fighter(fighterStats, 'Fighter', 0, Side.Left, battle, interaction.user.id),
        new Character(ratStats, 'Rat Pet', 1, Side.Left, battle)
    ];
    const right = [
        new Fighter(fighterStats, 'Fighter NPC', 0, Side.Right, battle),
        new Character(ratStats, 'Rat NPC', 1, Side.Right, battle)
    ];
    battle.addChars(left, right);
    
    await interaction.editReply({embeds: [battle.generateEmbed()]});

    battle.startCombat();
    const interval = setInterval(() => {
        void (async () => {
            const res = battle.nextTurn();
            await interaction.editReply({embeds: [battle.generateEmbed()]});
            if (res.combatEnded) clearInterval(interval);
        })();
    }, 0.5 * timeInMS.second);
}

const name = 'pve';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Auto Battler')
    ;

export default { execute, name, subcommandBuilder };