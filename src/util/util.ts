import moment from 'moment-timezone';

// Random integer between 0 and max
function getRandomRange({min = 0, max}: {min?: number, max: number}): number {
    return Math.floor(Math.random() * (max - min) + min);
}

function getMomentTorontoCurrentTime() {
    return moment().utc().tz('America/Toronto');
}

function dateToDbString(date: Date): string {
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

enum timeInMS {
    second = 1_000,
    minute = 60_000,
    hour = 3_600_000,
    day = 86_400_000
}

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

function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function roundToDecimalPlaces(num: number, places: number): number {
    const mult = 10 ** places;
    return Math.round(num * mult) / mult;
}

export { timeInMS, getRandomRange, getMomentTorontoCurrentTime, dateToDbString, msToString, capitalize, roundToDecimalPlaces };