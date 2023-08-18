import audio from './util/audioFileMap';
import userIds from './userIds';

const intros: {[key:string]: string} = {
    [userIds.ALDA]: audio.allThe,
    [userIds.ANDYD]: audio.wolfHowl,
    [userIds.CALVIN]: audio.blackenChineseMan,
    [userIds.JED]: audio.ciSin,
    [userIds.MICHAEL]: audio.theOfficeMichael,
    [userIds.WAYNE]: audio.docChineseMotorcycle
};

export default intros;