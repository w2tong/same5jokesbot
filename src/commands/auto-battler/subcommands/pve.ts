import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import Character from '../../../autoBattler/Character';
import PlayerCharacter from '../../../autoBattler/PlayerCharacter';
import Battle from '../../../autoBattler/Battle';
import { fighterStats, ratStats } from '../../../autoBattler/templates';
import { timeInMS } from '../../../util/util';


async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const player = new PlayerCharacter(fighterStats, 'Fighter', 0, interaction.user.id);

    const battle = new Battle(
        [player],
        [
            new Character(fighterStats, 'Fighter NPC', 0),
        ]);
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