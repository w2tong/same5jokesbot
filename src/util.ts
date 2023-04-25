import moment from 'moment-timezone';

// Random integer between 0 and max
function getRandomRange(max: number): number {
    return Math.floor(Math.random() * max);
}

function getMomentCurrentTimeEST() {
    return moment().utc().tz('America/Toronto');
}

function convertDateToUnixTimestamp(date: Date) {
    return Math.floor(date.getTime()/1000);
}

const timeInMS: {[key: string]: number} = {
    minute: 60_000,
    hour: 3_600_000,
    day: 86_400_000
};
function parseDate(num: number, time: string) {
    return new Date(Date.now() + timeInMS[time] * num);
}

export { getRandomRange, getMomentCurrentTimeEST, convertDateToUnixTimestamp, parseDate };