import { Client, Collection, EmbedBuilder, InteractionEditReplyOptions, User, time, userMention } from 'discord.js';
import schedule from 'node-schedule';
import { dateToDbString, timeInMS } from '../../util/util';
import { CringePointsUpdate, getUserCringePoints, houseUserTransfer, updateCringePoints } from '../../sql/tables/cringe-points';
import { deleteStolenGood, deleteUserStolenGoods, getStolenGoods, insertStolenGood } from '../../sql/tables/stolen-goods';
import { nanoid } from 'nanoid';
import { emptyEmbedFieldInline } from '../../util/discordUtil';
import { ProfitType, ProfitsUpdate, updateProfits } from '../../sql/tables/profits';
import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';

type StealEvents = {
    steal: (userId: string, amount: number, client: Client, channelId: string) => Promise<void>
  }
const stealEmitter = new EventEmitter() as TypedEmitter<StealEvents>;

const stolenGoods: Collection<string, Collection<string, stolenGood>> = new Collection();
const stolenTime = timeInMS.minute * 15;
const stealPcMax = 0.01;
const stealMin = 1_000;
const stealMax = 1_000_000;
const victimExtraPc = 0.5;
const houseExtraPc = 0.25;
const debtLimit = -10_000;
type stolenGood = {victimId: string, points: number, time: number};

function scheduleSteal(stealerId: string, victimId: string, points: number, time: number, id?: string) {
    let job: schedule.Job;
    const date = new Date(time);
    if (id) {
        job = schedule.scheduleJob(id, date, () => {});
    }
    else {
        job = schedule.scheduleJob(date, () => {});
    }

    job.on('success',  () => {
        void deleteStolenGood(job.name);
        stolenGoods.get(stealerId)?.delete(job.name);
    });

    return job.name;
}

function addStolenGood(jobId: string, stealerId: string, victimId: string, points: number, time: number) {
    const userStolenGoods = stolenGoods.get(stealerId);
    if (!userStolenGoods) {
        stolenGoods.set(stealerId, new Collection());
    }
    stolenGoods.get(stealerId)?.set(jobId, {victimId, points, time});
}

async function forfeitStolenGoods(stealer: User, victimUsername: string, extraPc: number, house: boolean, amount: number): Promise<InteractionEditReplyOptions> {
    await deleteUserStolenGoods(stealer.id);
    const userStolenGoods = stolenGoods.get(stealer.id);
    if (userStolenGoods && userStolenGoods.size > 0) {
        const stealerPoints = await getUserCringePoints(stealer.id) ?? 0;
        const profitUpdates: ProfitsUpdate[] = [];
        let pointsForfeitTotal = 0;
        const victims = [];
        const pointsForfeit = [];
        const times = [];
        
        if (!house) {
            const updates: CringePointsUpdate[] = [];
            for (const {victimId, points, time} of userStolenGoods.values()) {
                const pointsExtraPc = Math.round(points * extraPc);
                updates.push(
                    {userId: victimId, points: points + pointsExtraPc},
                    {userId: stealer.id, points: -(points + pointsExtraPc)}
                );
                profitUpdates.push(
                    {userId: victimId, type: ProfitType.Steal, profit: points + pointsExtraPc},
                    {userId: stealer.id, type: ProfitType.Steal, profit: -(points + pointsExtraPc)}
                );
                victims.push(userMention(victimId));
                pointsForfeitTotal += points + pointsExtraPc;
                pointsForfeit.push(`${points.toLocaleString()} (+${pointsExtraPc.toLocaleString()})`);
                times.push(time);
            }
            await updateCringePoints(updates);
        }
        else {
            const updates: CringePointsUpdate[] = [];
            for (const {victimId, points, time} of userStolenGoods.values()) {
                updates.push({userId: stealer.id, points: -points});
                profitUpdates.push({userId: stealer.id, type: ProfitType.Steal, profit: -points});
                victims.push(userMention(victimId));
                pointsForfeitTotal += points;
                pointsForfeit.push(`${points.toLocaleString()}`);
                times.push(time);
            }
            await houseUserTransfer(updates);
        }
        
        await updateProfits(profitUpdates);
        userStolenGoods.clear();
        const embed = new EmbedBuilder()
            .setAuthor({name: `${stealer.username} steal from ${victimUsername} FAILED`, iconURL: stealer.displayAvatarURL()})
            .addFields(
                {name: 'Balance', value: `${(stealerPoints - amount).toLocaleString()} (${(-(pointsForfeitTotal - amount)).toLocaleString()})`, inline: true},
                {name: 'New Balance', value: `${(stealerPoints - pointsForfeitTotal).toLocaleString()}`, inline: true},
                emptyEmbedFieldInline,
                {name: 'Forfeited to', value: `${house ? 'House' : 'Victims'}`, inline: true},
                {name: 'Extra Percent', value: `${(extraPc * 100)}%`, inline: true},
                emptyEmbedFieldInline,
                {name: 'User', value: victims.join('\n'), inline: true},
                {name: 'Points Forfeited', value: pointsForfeit.join('\n'), inline: true},
                {name: 'Safe', value: times.map(t => time(new Date(t), 'R')).join('\n'), inline: true}
            );
        return {embeds: [embed]};
    }
    return {content: 'There are no goods to forfeit.'};
}

async function newSteal(stealer: User, victimId: string, victimUsername: string, amount: number, client: Client, channelId: string): Promise<InteractionEditReplyOptions> {
    if (stealer.id === victimId) {
        return {content: 'You cannot steal from yourself.'};
    }
    // Check if stealer points are negative
    const stealerPoints = await getUserCringePoints(stealer.id) ?? -Infinity;
    if (stealerPoints < debtLimit) return {content: `You cannot steal when you are in debt (${debtLimit.toLocaleString()}).`};
    // Check if user has enough points and under steal limit
    const victimPoints = await getUserCringePoints(victimId) ?? 0;
    if (victimPoints <= 0) {
        return {content: `${userMention(victimId)} does not have any points.`};
    }

    const victimStealPc = Math.floor(victimPoints * stealPcMax);
    if (amount > 0) {
        if (victimPoints < amount) {
            return {content: `${userMention(victimId)} does not have enough points.`};
        }
        if (amount > Math.max(victimStealPc, stealMin)) {
            return {content: `You cannot steal more than ${Math.floor(victimStealPc).toLocaleString()} (${(stealPcMax * 100).toFixed(1)}%) or ${stealMax.toLocaleString()} from ${userMention(victimId)}.`};
        }
    }
    else {
        amount = Math.max(Math.min(victimStealPc, stealMax), (victimPoints > stealMin ? stealMin : victimPoints));
    }
        
    const result = Math.random();
    const time = Date.now() + stolenTime;
    const stolenGoodId = nanoid();
    addStolenGood(stolenGoodId, stealer.id, victimId, amount, time);
    await Promise.all([
        await updateCringePoints([
            {userId: stealer.id, points: amount},
            {userId: victimId, points: -amount}
        ]),
        await updateProfits([
            {userId: stealer.id, type: ProfitType.Steal, profit: amount},
            {userId: victimId, type: ProfitType.Steal, profit: -amount},
        ])
    ]);
    stealEmitter.emit('steal', stealer.id, amount, client, channelId);
    
    // Fail
    if (result >= 0 && result < 0.55) {
        return await forfeitStolenGoods(stealer, victimUsername, victimExtraPc, false, amount);
    }
    // Success
    else if (result >= 0.55 && result < 0.95) {
        scheduleSteal(stealer.id, victimId, amount, time, stolenGoodId);
        addStolenGood(stolenGoodId, stealer.id, victimId, amount, time);
        await insertStolenGood(stolenGoodId, stealer.id, victimId, amount, dateToDbString(new Date(time)));
        const {victims, points, times} = formatStolenGoodsFields(stealer.id);
        const embed = new EmbedBuilder()
            .setAuthor({name: `${stealer.username} steal from ${victimUsername} SUCCEEDED`, iconURL: stealer.displayAvatarURL()})
            .addFields(
                {name: 'Stealer', value: userMention(stealer.id), inline: true},
                {name: 'Victim', value: userMention(victimId), inline: true},
                emptyEmbedFieldInline,
                {name: 'Balance', value: `${stealerPoints?.toLocaleString()} (+${amount.toLocaleString()})`, inline: true},
                {name: 'Balance', value: `${victimPoints.toLocaleString()} (-${amount.toLocaleString()})`, inline: true},
                emptyEmbedFieldInline,
                {name: 'New Balance', value: `${(stealerPoints + amount).toLocaleString()}`, inline: true},
                {name: 'New Balance', value: `${(victimPoints - amount).toLocaleString()}`, inline: true},
                emptyEmbedFieldInline,
                {name: 'Victim', value: victims.join('\n'), inline: true},
                {name: 'Points', value: points.join('\n'), inline: true},
                {name: 'Safe', value: times.join('\n'), inline: true}
            );
        return {embeds: [embed]};
    }
    // House
    else {
        return await forfeitStolenGoods(stealer, victimUsername, houseExtraPc, true, amount);
    }
}

async function loadStolenGoods() {
    const stolenGoodsToLoad = await getStolenGoods();
    for (const {ID, STEALER_ID, VICTIM_ID, POINTS, TIME} of stolenGoodsToLoad) {
        const time = new Date(`${TIME} UTC`).getTime();
        if (time <= Date.now()) {
            void deleteStolenGood(ID);
            continue;
        }
        scheduleSteal(STEALER_ID, VICTIM_ID, POINTS, time, ID);
        if (!stolenGoods.has(STEALER_ID)) {
            stolenGoods.set(STEALER_ID, new Collection());
        }
        stolenGoods.get(STEALER_ID)?.set(ID, {victimId: VICTIM_ID, points: POINTS, time});
    }
}

function formatStolenGoodsFields(userId: string) {
    const goods = stolenGoods.get(userId);
    const victims: string[] = [];
    const points: string[] = [];
    const times = [];
    if (goods) {
        for (const good of goods.values()) {
            victims.push(userMention(good.victimId));
            points.push(good.points.toLocaleString());
            times.push(time(new Date(good.time), 'R'));
        }
    }
    return {victims, points, times};
}

function displayStolenGoods(user: User): InteractionEditReplyOptions {
    const userStolenGoods = stolenGoods.get(user.id);
    if (userStolenGoods && userStolenGoods.size > 0) {
        const {victims, points, times} = formatStolenGoodsFields(user.id);
        const embed = new EmbedBuilder()
            .setAuthor({name: `${user.username}'s Stolen Goods`, iconURL: user.displayAvatarURL()})
            .addFields(
                {name: 'Victim', value: victims.join('\n'), inline: true},
                {name: 'Points', value: points.join('\n'), inline: true},
                {name: 'Safe', value: times.join('\n'), inline: true}
            );
        return {embeds: [embed]
        };
    }
    else {
        return {content: 'You have no stolen goods.'};
    }
}

export { newSteal, loadStolenGoods, displayStolenGoods, stealPcMax, stealMax, victimExtraPc, houseExtraPc, stealEmitter };