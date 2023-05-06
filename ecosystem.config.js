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
            host: [process.env.SSH_KNOWN_HOSTS],
            user: process.env.SSH_USER,
            key: '~/.ssh/deploy.key',
            ssh_options: 'StrictHostKeyChecking=no',
            ref: 'origin/main',
            repo: 'https://github.com/w2tong/Same5JokesBot.git',
            path: '/home/opc/Same5JokesBot',
            'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production && pm2 save'
        }
    }
};