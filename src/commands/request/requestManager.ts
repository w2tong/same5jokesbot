import { getUserCringePoints } from '../../sql/tables/cringe-points';

const audio = {
    min: 1_000_000,
    maxPc: 0.1
};

async function fetchAudioRequestPrice(): Promise<number> {
    const points: number = process.env.CLIENT_ID ? await getUserCringePoints(process.env.CLIENT_ID) ?? 0 : 0;
    return Math.max(audio.min, Math.floor(-points * audio.maxPc));
}

export { audio, fetchAudioRequestPrice };