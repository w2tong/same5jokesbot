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
    second: 1_000,
    minute: 60_000,
    hour: 3_600_000,
    day: 86_400_000
};

function msToString(ms: number) {
    const days = Math.floor(ms/timeInMS.day);
    ms %= timeInMS.day;
    const hours = Math.floor(ms/timeInMS.hour);
    ms %= timeInMS.hour;
    const minutes = Math.floor(ms/timeInMS.minute);
    ms %= timeInMS.minute;
    const seconds = Math.floor(ms/timeInMS.second);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

export { timeInMS, getRandomRange, getMomentCurrentTimeEST, convertDateToUnixTimestamp, msToString };