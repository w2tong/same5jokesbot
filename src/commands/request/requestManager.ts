import { getUserAvgCringePoints } from '../../sql/tables/cringe-points';

const audio = {
    min: 1_000_000,
    maxPc: 0.1
};

async function fetchAudioRequestPrice(): Promise<number> {
    const avgCount = await getUserAvgCringePoints();
    const avg = avgCount?.POINTS ?? 0;
    const count = avgCount?.COUNT ?? 1;
    const price = avg * count / 4;
    console.log(price);
    return Math.max(audio.min, price);
}

export { audio, fetchAudioRequestPrice };