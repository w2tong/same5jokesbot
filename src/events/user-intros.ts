import * as dotenv from 'dotenv';
dotenv.config();

const userIntros: {[key: string]: string} = {};

if (process.env.ALDA_ID) {
    userIntros[process.env.ALDA_ID] = 'all_the';
}

export default userIntros;