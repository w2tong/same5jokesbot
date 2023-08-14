import { Collection, EmbedBuilder, InteractionEditReplyOptions, time, userMention } from 'discord.js';
import schedule from 'node-schedule';
import { dateToDbString, timeInMS } from '../../util/util';
import { CringePointsUpdate, updateCringePoints } from '../../sql/tables/cringe-points';
import { deleteStolenGood, deleteUserStolenGoods, getStolenGoods, insertStolenGood } from '../../sql/tables/stolen-goods';
import { nanoid } from 'nanoid';

const stolenGoods: Collection<string, Collection<string, stolenGood>> = new Collection();
const stolenTime = timeInMS.hour * 1;
type stolenGood = {victimId: string, points: number, time: number};

function scheduleSteal(stealerId: string, victimId: string, points: number, time: number, id?: string) {
    let job: schedule.Job;
    const date = new Date(time);
    const updatePoints = async function() {
        await updateCringePoints([
            {userId: victimId, points: -points},
            {userId: stealerId, points}
        ]);
    };
    if (id) {
        job = schedule.scheduleJob(id, date, updatePoints);
    }
    else {
        job = schedule.scheduleJob(date, updatePoints);
    }

    job.on('success',  () => {
        void deleteStolenGood(job.name);
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

async function forfeitStolenGoods(stealerId: string, extraPc: number, house: boolean) {
    await deleteUserStolenGoods(stealerId);
    const userStolenGoods = stolenGoods.get(stealerId);
    if (userStolenGoods && userStolenGoods.size > 0) {
        const updates: CringePointsUpdate[] = [];
        if (!house) {
            for (const {victimId, points} of userStolenGoods.values()) {
                updates.push(
                    {userId: victimId, points: points + points * extraPc},
                    {userId: stealerId, points: -(points + points * extraPc)}
                );
            }
        }
        else {
            for (const {victimId, points} of userStolenGoods.values()) {
                updates.push({userId: victimId, points: points + points * extraPc});
                if (process.env.CLIENT_ID) updates.push({userId: process.env.CLIENT_ID, points: -(points + points * extraPc)});
            }
        }
        userStolenGoods.clear();
    }
}

async function newSteal(stealerId: string, victimId: string, points: number) {
    const result = Math.random();
    // Fail
    if (result >= 0 && result < 0.55) {
        addStolenGood(nanoid(), stealerId, victimId, points, 0);
        await forfeitStolenGoods(stealerId, 0.25, false);
    }
    // Success
    else if (result >= 0.55 && result < 0.95) {
        const time = Date.now() + stolenTime;
        const jobId = scheduleSteal(stealerId, victimId, points, time);
        addStolenGood(jobId, stealerId, victimId, points, time);
        await insertStolenGood(jobId, stealerId, victimId, points, dateToDbString(new Date(time)));
    }
    // House
    else {
        addStolenGood(nanoid(), stealerId, victimId, points, 0);
        await forfeitStolenGoods(stealerId, 0, true);
    }
}

async function loadStolenGoods() {
    const stolenGoodsToLoad = await getStolenGoods();
    for (const {ID, STEALER_ID, VICTIM_ID, POINTS, TIME} of stolenGoodsToLoad) {
        // delete from DB if date passed
        const time = new Date(`${TIME} UTC`).getTime();
        scheduleSteal(STEALER_ID, VICTIM_ID, POINTS, time, ID);
        if (!stolenGoods.has(STEALER_ID)) {
            stolenGoods.set(STEALER_ID, new Collection());
        }
        stolenGoods.get(STEALER_ID)?.set(ID, {victimId: VICTIM_ID, points: POINTS, time});
    }
}

function formatStolenGoodsFields(goods: Collection<string, stolenGood>) {
    const victims: string[] = [];
    const points: string[] = [];
    const times = [];
    for (const good of goods.values()) {
        victims.push(userMention(good.victimId));
        points.push(good.points.toLocaleString());
        times.push(time(new Date(good.time), 'R'));
    }
    return {victims, points, times};
}

function displayStolenGoods(userId: string, username: string): InteractionEditReplyOptions {
    const userStolenGoods = stolenGoods.get(userId);
    if (userStolenGoods && userStolenGoods.size > 0) {
        const {victims, points, times} = formatStolenGoodsFields(userStolenGoods);
        return {embeds: [new EmbedBuilder()
            .setTitle(`${username}'s Stolen Goods`)
            .addFields(
                {name: 'Victim', value: victims.join('\n'), inline: true},
                {name: 'Points', value: points.join('\n'), inline: true},
                {name: 'Time', value: times.join('\n'), inline: true}
            )]
        };
    }
    else {
        return {content: 'You have no stolen goods'};
    }
}

export { newSteal, loadStolenGoods, displayStolenGoods };