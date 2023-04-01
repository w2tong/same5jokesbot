import moment from 'moment-timezone';

// Random integer between 0 and max
function getRandomRange(max: number): number {
    return Math.floor(Math.random() * max);
}

function getMomentCurrentTimeEST() {
    return moment().utc().tz('America/Toronto');
}

function getTimestampEST(date: Date) {
    return moment(date).utc().tz('America/Toronto').format('MMM D, h:mm:ss a');
}

export { getRandomRange, getMomentCurrentTimeEST, getTimestampEST };