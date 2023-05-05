module.exports = {
    apps : [{
        name: 'same5jokesbot',
        script: 'npm start',
        watch: true,
        ignore_watch: ['node_modules','src/audio','logs','.env'],
        log_file: 'logs/pm2.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }]
};