require('dotenv').config();

module.exports = {
    apps : [{
        name: 'same5jokesbot',
        script: 'npm start',
        watch: true,
        ignore_watch: ['node_modules','src/audio','logs','.env'],
        log_file: 'logs/pm2.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }],
    deploy: {
        production: {
            host: process.env.HOST,
            user: process.env.USER,
            ref: 'origin/main', // (use 'origin/master' for your master branch,
            repo: 'git@github.com:w2tong/Same5JokesBot.git', // your repo url
            path: '/home/opc/Same5JokesBot',
            'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production && pm2 save'
        }
    }
};