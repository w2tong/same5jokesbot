import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import Character from '../autoBattler/Character';
import PlayerCharacter from '../autoBattler/PlayerCharacter';
import Battle from '../autoBattler/Battle';
import { fighterStats } from '../autoBattler/templates';


async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const player = new PlayerCharacter(fighterStats, 'Fighter', 0, interaction.user.id);
    const enemy = new Character(fighterStats, 'Fighter', 0);
    const battle = new Battle([player], [enemy]);
    await interaction.editReply({embeds: [battle.generateEmbed()]});

    battle.startCombat();
    let combatEnd = false;
    // let winner;
    while(!combatEnd) {
        const res = battle.nextTurn();
        await interaction.editReply({embeds: [battle.generateEmbed()]});
        combatEnd = res.combatEnded;
        // winner = res.winner;
    }
    await interaction.editReply({embeds: [battle.generateEmbed()]});
}

const name = 'auto-battle';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('TODO')
    ;

export default { execute, name, commandBuilder };