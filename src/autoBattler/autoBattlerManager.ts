import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, ComponentType, EmbedBuilder, userMention } from 'discord.js';
import { getABSelectedChar, updateABCharExp } from '../sql/tables/ab_characters';
import { getRandomRange, timeInMS } from '../util/util';
import Battle, { Side } from './Battle';
import { getRandomEncounter } from './encounters';
import { getUserCringePoints, updateCringePoints } from '../sql/tables/cringe_points';
import { emptyEmbedFieldInline, getBalanceStrings } from '../util/discordUtil';
import { encounterExp, levelExp } from './experience';
import { Equip, equips, getItemTooltip } from './Equipment/Equipment';
import lootTables from './lootTables';
import { insertABInventoryItem } from '../sql/tables/ab_inventory';
import { createPlayerChar } from './util';

const usersInBattle: Set<string> = new Set();
const ExpLoss = 0.025;
const lootChance = process.env.NODE_ENV === 'development' ? 1 : 0.25;

async function addLoot(userId: string, level: number): Promise<Equip|null> {
    if (Math.random() < lootChance) {
        const lootTable = lootTables[level];
        const itemId = Math.random() < lootTable.rareChance ? lootTable.rare[getRandomRange(lootTable.rare.length)] : lootTable.normal[getRandomRange(lootTable.normal.length)];
        await insertABInventoryItem(userId, itemId);
        return equips[itemId];
    }
    return null;
}

async function newPvEBattle(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const user = interaction.user;
    const fullLog = interaction.options.getBoolean('full-log') ?? false;

    if (usersInBattle.has(user.id)) {
        await interaction.editReply('You are already in a battle.');
        return;
    }

    const userChar = await getABSelectedChar(user.id);

    if (!userChar) {
        await interaction.editReply('You do not have a selected character.');
        return;
    }
    const level = interaction.options.getInteger('level') ?? userChar.CHAR_LEVEL;

    usersInBattle.add(user.id);
    
    const battle = new Battle(
        [await createPlayerChar(user.id, userChar)],
        getRandomEncounter(level),
        {fullLog}
    );
    
    await interaction.editReply({embeds: [battle.generateEmbed()]});

    battle.startCombat();
    const interval = setInterval(() => {
        void (async () => {
            const res = battle.nextTurn();
            const embeds = [battle.generateEmbed()];
            if (res.combatEnded) {
                usersInBattle.delete(user.id);
                clearInterval(interval);
                if (res.winner !== Side.Tie) {
                    const expEmbed = new EmbedBuilder();
                    let expChange = 0;
                    if (res.winner === Side.Left) {
                        expChange = encounterExp[level];
                        expEmbed.setTitle('Victory');
                        const loot = await addLoot(user.id, level);
                        if (loot) {
                            embeds.push(new EmbedBuilder()
                                .setAuthor({name: `${user.username} looted ${loot.name}.`, iconURL: user.displayAvatarURL()})
                                .addFields({name: loot.name, value: getItemTooltip(loot)})
                            );
                        }
                    }
                    else {    
                        expChange = -Math.round(levelExp[userChar.CHAR_LEVEL] * ExpLoss);
                        expEmbed.setTitle('Defeat');
                        // TODO: set char curr health to 1
                    }
                    const newLevelAndExp = await updateABCharExp(user.id, userChar, expChange);
                    if (newLevelAndExp) {
                        if (newLevelAndExp.level > userChar.CHAR_LEVEL) {
                            expEmbed.addFields(
                                {name: 'Level', value: `${userChar.CHAR_LEVEL}`, inline: true},
                                {name: 'New Level', value: `${newLevelAndExp.level}`, inline: true},
                                emptyEmbedFieldInline
                            );
                        }
                        expEmbed.addFields(
                            {name: 'Exp Gain', value: `${userChar.EXPERIENCE.toLocaleString()}(${expChange > 0 ? '+' : ''}${expChange.toLocaleString()})/${levelExp[userChar.CHAR_LEVEL].toLocaleString()}`, inline: true},
                                
                        );
                        if (levelExp[newLevelAndExp.level]) {
                            expEmbed.addFields(
                                {name: 'New Exp', value: `${newLevelAndExp.exp.toLocaleString()}/${levelExp[newLevelAndExp.level].toLocaleString()}`, inline: true},
                                {name: 'Next Lvl', value: `${(levelExp[newLevelAndExp.level] - newLevelAndExp.exp).toLocaleString()}`, inline: true}
                            );
                        }
                    }
                    else {
                        expEmbed.setDescription(`${userChar.CHAR_NAME} is at max level.`);
                    }
                    embeds.push(expEmbed);
                }
            }
            await interaction.editReply({embeds});
        })();
    }, 0.5 * timeInMS.second);
}

async function newPvPBattle(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const user = interaction.user;
    const opponent = interaction.options.getUser('user');
    const wager = interaction.options.getInteger('wager') ?? 0;
    const fullLog = interaction.options.getBoolean('full-log') ?? false;
    
    if (!opponent || !interaction.channel) {
        await interaction.editReply('There was an error creating the auto battle.');
        return;
    }

    if (usersInBattle.has(user.id)) {
        await interaction.editReply('You are already in a battle.');
        return;
    }
    if (usersInBattle.has(opponent.id)) {
        await interaction.editReply(`${opponent} is already in a battle.`);
        return;
    }

    const userChar = await getABSelectedChar(user.id);
    const opponentChar = await getABSelectedChar(opponent.id);

    if (!userChar) {
        await interaction.editReply('You do not have a selected character.');
        return;
    }
    if (!opponentChar) {
        await interaction.editReply(`${opponent} does not have a selected character.`);
        return;
    }

    const userBalance = await getUserCringePoints(user.id) ?? 0;
    const opponentBalance = await getUserCringePoints(opponent.id) ?? 0;
    if (userBalance < wager || opponentBalance < wager) {
        const errMsgs = [];
        if (userBalance < wager) {
            errMsgs.push(`You do not have enough points (Balance: ${userBalance.toLocaleString()}).`);
        }
        if (opponentBalance < wager) {
            errMsgs.push(`${opponent} does not enough points (Balance: ${opponentBalance.toLocaleString()}).`);
        }
        await interaction.editReply(errMsgs.join('\n'));
        return;
    }

    const battle = new Battle(
        [await createPlayerChar(user.id, userChar)],
        [await createPlayerChar(opponent.id, opponentChar)],
        {fullLog}
    );

    const acceptButtonId = 'accept';
    const decliceButtonId = 'decline';
    const buttonsRow = new ActionRowBuilder<ButtonBuilder>();
    buttonsRow.addComponents(
        new ButtonBuilder()
            .setCustomId(acceptButtonId)
            .setLabel(`Accept (Wager: ${wager.toLocaleString()})`)
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId(decliceButtonId)
            .setLabel('Decline')
            .setStyle(ButtonStyle.Danger)
    );
    const reply = await interaction.editReply({embeds: [battle.generateEmbed()], components: [buttonsRow]});
    await interaction.channel.send(`${userMention(user.id)} challenged ${userMention(opponent.id)} to an auto battle.`);

    const buttonFilter = async (i: ButtonInteraction) => {
        if (i.user.id !== opponent.id) {
            await i.reply({content: 'You are not in this auto battle.', ephemeral: true});
            return false;
        }
        return true;
    };

    const buttonCollector = reply.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15*timeInMS.minute, filter: buttonFilter });
    buttonCollector.on('collect', async buttonInteraction => {
        await buttonInteraction.update({});
        buttonCollector.stop();
        if (buttonInteraction.customId === acceptButtonId) {
            usersInBattle.add(user.id,);
            usersInBattle.add(opponent.id);
            battle.startCombat();
            const interval = setInterval(() => {
                void (async () => {
                    const res = battle.nextTurn();
                    if (res.combatEnded) {
                        clearInterval(interval);
                        usersInBattle.delete(user.id,);
                        usersInBattle.delete(opponent.id);
                        
                        if (res.winner === Side.Tie) {
                            await buttonInteraction.editReply({embeds: [battle.generateEmbed()]});
                            return;
                        }
                        else {
                            let userBalanceStr;
                            let opponentBalanceStr;
                            if (res.winner === Side.Left) {
                                userBalanceStr = getBalanceStrings(userBalance, wager);
                                opponentBalanceStr = getBalanceStrings(opponentBalance, -wager);
                                await updateCringePoints([
                                    {userId: user.id, points: wager},
                                    {userId: opponent.id, points: -wager},
                                ]);
                            
                            }
                            else {
                                userBalanceStr = getBalanceStrings(userBalance, -wager);
                                opponentBalanceStr = getBalanceStrings(opponentBalance, wager);
                                await updateCringePoints([
                                    {userId: user.id, points: -wager},
                                    {userId: opponent.id, points: wager},
                                ]);
                            }

                            const balanceEmbed = new EmbedBuilder()
                                .setTitle('Auto Battle Balance')
                                .addFields(
                                    {name: `${user.username} Balance`, value: userBalanceStr.balance, inline: true},
                                    emptyEmbedFieldInline,
                                    {name: `${opponent.username} Balance`, value: opponentBalanceStr.balance, inline: true},

                                    {name: `${user.username} New Balance`, value: userBalanceStr.newBalance, inline: true},
                                    emptyEmbedFieldInline,
                                    {name: `${opponent.username} New Balance`, value: opponentBalanceStr.newBalance, inline: true}
                                );
                            await buttonInteraction.editReply({embeds: [battle.generateEmbed(), balanceEmbed]});
                        }
                    }
                    else {
                        await buttonInteraction.editReply({embeds: [battle.generateEmbed()]});
                    }
                })();
            }, 0.5 * timeInMS.second);
        }
        else {
            await buttonInteraction.editReply({content: `${userMention(opponent.id)} declined the auto battle.`, embeds: [], components: []});
        }
    });

    buttonCollector.on('end', async () => {
        await reply.edit({components: []});
    });
}

export { newPvEBattle, newPvPBattle };