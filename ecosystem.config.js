module.exports = {
    apps : [{
        name: 'same5jokesbot',
        script: 'npm start',
        cron_restart: '0 10 * * 0',
        exp_backoff_restart_delay: 1000,
        // max_memory_restart: '300M',
        // watch: true,
        // ignore_watch: ['node_modules','dist','audio','logs','coverage','.env'],
        out_file: 'logs/pm2.out.log',
        error_file: 'logs/pm2.error.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        env: {
            'NODE_ENV': 'development'
        },
        env_production: {
            'NODE_ENV': 'production'
        }
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
            'post-deploy': 'npm install && npx tsc --build tsconfig.build.json && pm2 reload ecosystem.config.js --env production && pm2 save'
        }
    }
};