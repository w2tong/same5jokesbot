require('dotenv').config();

module.exports = {
    apps : [{
        name: 'same5jokesbot',
        script: 'npm start',
        cron_restart: '0 10 * * *',
        watch: true,
        ignore_watch: ['node_modules','src/audio','logs','.env'],
        out_file: 'logs/pm2.out.log',
        error_file: 'logs/pm2.error.log',
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
            path: `/home/${process.env.SSH_USER}/Same5JokesBot`,
            'post-deploy': 'npm install --omit=dev && pm2 reload ecosystem.config.js --env production && pm2 save'
        }
    }
};