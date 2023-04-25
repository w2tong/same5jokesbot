import * as dotenv from 'dotenv';
dotenv.config();

const userIntros: {[key: string]: string} = {};

if (process.env.ALDA_ID) userIntros[process.env.ALDA_ID] = 'all_the';
if (process.env.JED_ID) userIntros[process.env.JED_ID] = 'arthur_knitter_short';

export default userIntros;