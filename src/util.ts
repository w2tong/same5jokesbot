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

export { getRandomRange, getMomentCurrentTimeEST, convertDateToUnixTimestamp };