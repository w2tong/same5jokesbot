import { Collection, EmbedBuilder, InteractionEditReplyOptions, bold, time, userMention } from 'discord.js';
import schedule from 'node-schedule';
import { dateToDbString, timeInMS } from '../../util/util';
import { CringePointsUpdate, getUserCringePoints, updateCringePoints } from '../../sql/tables/cringe-points';
import { deleteStolenGood, deleteUserStolenGoods, getStolenGoods, insertStolenGood } from '../../sql/tables/stolen-goods';
import { nanoid } from 'nanoid';
import { emptyEmbedField } from '../../util/discordUtil';

const stolenGoods: Collection<string, Collection<string, stolenGood>> = new Collection();
const stolenTime = timeInMS.hour * 1;
const stealPcMax = 0.005;
const stealNumMax = 1000;
const victimExtraPc = 0.25;
const houseExtraPc = 0;
const debtLimit = 100_000;
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

async function forfeitStolenGoods(stealerId: string, stealerUsername: string, victimUsername: string, extraPc: number, house: boolean): Promise<InteractionEditReplyOptions> {
    await deleteUserStolenGoods(stealerId);
    const userStolenGoods = stolenGoods.get(stealerId);
    if (userStolenGoods && userStolenGoods.size > 0) {
        const stealerPoints = await getUserCringePoints(stealerId) ?? 0;
        const updates: CringePointsUpdate[] = [];
        let pointsForfeitTotal = 0;
        const victims = [];
        const pointsForfeit = [];
        const times = [];
        if (!house) {
            for (const {victimId, points, time} of userStolenGoods.values()) {
                const pointsExtraPc = Math.round(points * extraPc);
                updates.push(
                    {userId: victimId, points: points + pointsExtraPc},
                    {userId: stealerId, points: -(points + pointsExtraPc)}
                );
                victims.push(userMention(victimId));
                pointsForfeitTotal += points + pointsExtraPc;
                pointsForfeit.push(`${points} (+${pointsExtraPc})`);
                times.push(time);
            }
        }
        else {
            for (const {victimId, points, time} of userStolenGoods.values()) {
                if (process.env.CLIENT_ID) updates.push({userId: process.env.CLIENT_ID, points: points});
                updates.push({userId: stealerId, points: -points});
                victims.push(userMention(victimId));
                pointsForfeitTotal += points;
                pointsForfeit.push(`${points}`);
                times.push(time);
            }
        }
        await updateCringePoints(updates);
        userStolenGoods.clear();
        const embed = new EmbedBuilder()
            .setTitle(`${stealerUsername} steal from ${victimUsername} ${bold('FAILED')}`)
            .addFields(
                {name: 'Balance', value: `${stealerPoints.toLocaleString()} (-${pointsForfeitTotal.toLocaleString()})`, inline: true},
                {name: 'New Balance', value: `${(stealerPoints - pointsForfeitTotal).toLocaleString()}`, inline: true},
                emptyEmbedField,
                {name: 'Forfeited to', value: `${house ? 'House' : 'Victims'}`, inline: true},
                {name: 'Extra Percent', value: `${(extraPc * 100)}%`, inline: true},
                emptyEmbedField,
                {name: 'User', value: victims.join('\n'), inline: true},
                {name: 'Points Forfeited', value: pointsForfeit.map(p => p.toLocaleString()).join('\n'), inline: true},
                {name: 'Safe', value: times.map(t => time(new Date(t), 'R')).join('\n'), inline: true}
            );
        return {embeds: [embed]};
    }
    return {content: 'There are no goods to forfeit.'};
}

async function newSteal(stealerId: string, stealerUsername: string, victimId: string, victimUsername: string, amount: number): Promise<InteractionEditReplyOptions> {
    if (stealerId === victimId) {
        return {content: 'You cannot steal from yourself.'};
    }
    // Check if stealer points are negative
    const stealerPoints = await getUserCringePoints(stealerId) ?? -Infinity;
    if (stealerPoints < debtLimit) return {content: `You cannot steal when you are in debt (${debtLimit})`};
    // Check if user has enough points and under steal limit
    const victimPoints = await getUserCringePoints(victimId) ?? 0;
    if (amount > Math.max(victimPoints * stealPcMax, stealNumMax)) {
        return {content: `You cannot steal more than ${Math.floor(victimPoints * stealPcMax).toLocaleString()} (${(stealPcMax * 100).toFixed(1)}%) or ${stealNumMax.toLocaleString()}.`};
    }
        
    const result = Math.random();
    const time = Date.now() + stolenTime;
    // Fail
    if (result >= 0 && result < 0.55) {
        addStolenGood(nanoid(), stealerId, victimId, amount, time);
        return await forfeitStolenGoods(stealerId, stealerUsername, victimUsername, victimExtraPc, false);
    }
    // Success
    else if (result >= 0.55 && result < 0.95) {
        const jobId = scheduleSteal(stealerId, victimId, amount, time);
        await updateCringePoints([
            {userId: victimId, points: -amount},
            {userId: stealerId, points: amount}
        ]);
        addStolenGood(jobId, stealerId, victimId, amount, time);
        await insertStolenGood(jobId, stealerId, victimId, amount, dateToDbString(new Date(time)));
        const {victims, points, times} = formatStolenGoodsFields(stealerId);
        const embed = new EmbedBuilder()
            .setTitle(`${stealerUsername} steal from ${victimUsername} ${bold('SUCCEEDED')}`)
            .addFields(
                {name: 'Stealer', value: userMention(stealerId), inline: true},
                {name: 'Victim', value: userMention(victimId), inline: true},
                emptyEmbedField,
                {name: 'Balance', value: `${stealerPoints?.toLocaleString()} (+${amount.toLocaleString()})`, inline: true},
                {name: 'Balance', value: `${victimPoints.toLocaleString()} (-${amount.toLocaleString()})`, inline: true},
                emptyEmbedField,
                {name: 'New Balance', value: `${(stealerPoints + amount).toLocaleString()}`, inline: true},
                {name: 'New Balance', value: `${(victimPoints - amount).toLocaleString()}`, inline: true},
                emptyEmbedField,
                {name: 'Victim', value: victims.join('\n'), inline: true},
                {name: 'Points', value: points.join('\n'), inline: true},
                {name: 'Safe', value: times.join('\n'), inline: true}
            );
        return {embeds: [embed]};
    }
    // House
    else {
        addStolenGood(nanoid(), stealerId, victimId, amount, time);
        return await forfeitStolenGoods(stealerId, stealerUsername, victimUsername, houseExtraPc, true);
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

function displayStolenGoods(userId: string, username: string): InteractionEditReplyOptions {
    const userStolenGoods = stolenGoods.get(userId);
    if (userStolenGoods && userStolenGoods.size > 0) {
        const {victims, points, times} = formatStolenGoodsFields(userId);
        const embed = new EmbedBuilder()
            .setTitle(`${username}'s Stolen Goods`)
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

export { newSteal, loadStolenGoods, displayStolenGoods, stealPcMax, stealNumMax, victimExtraPc, houseExtraPc };