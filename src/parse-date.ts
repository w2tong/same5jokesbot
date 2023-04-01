const timeInMS: {[key: string]: number} = {
    minute: 60_000,
    hour: 360_000
};

export default function parseDate(num: number, time: string) {
    return new Date(Date.now() + timeInMS[time] * num);
}