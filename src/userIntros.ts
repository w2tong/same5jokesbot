import audio from './audioFileMap';

const ALDA_ID = '147095136709509120';
const ANDYD_ID = '213516916705198080';
const AZI_ID = '180881117547593728';
const CALVIN_ID = '163145302960766977';
const GERRY_ID = '127994145624162304';
const JED_ID = '107661528643174400';
const MICHAEL_ID = '164856525863518209';
const WAYNE_ID = '158048359591051274';

const userIds: {[key:string]: string} = {
    [ALDA_ID]: audio.allThe,
    [ANDYD_ID]: audio.wolfHowl,
    [CALVIN_ID]: audio.blackenChineseMan,
    [JED_ID]: audio.whatAFdUpDay,
    [MICHAEL_ID]: audio.thisIsLibrary,
    [WAYNE_ID]: audio.docChineseMotorcycle
};

export default userIds;