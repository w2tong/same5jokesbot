import * as dotenv from 'dotenv';
dotenv.config();

const userIntros: {[key: string]: string} = {};

if (process.env.ALDA_ID) userIntros[process.env.ALDA_ID] = 'all_the';
if (process.env.ANDYD_ID) userIntros[process.env.ANDYD_ID] = 'wolf_howl';
if (process.env.CALVIN_ID) userIntros[process.env.CALVIN_ID] = 'gigachad';
if (process.env.JED_ID) userIntros[process.env.JED_ID] = 'what_a_fd_up_day';
if (process.env.MICHAEL_ID) userIntros[process.env.MICHAEL_ID] = 'this_is_library';
if (process.env.WAYNE_ID) userIntros[process.env.WAYNE_ID] = 'doc_chinese_motorcycle';

export default userIntros;