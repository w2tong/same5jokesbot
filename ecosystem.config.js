module.exports = {
    apps : [{
        name: 'same5jokesbot',
        script: 'pm2 start npm -- start',
        watch: true,
        ignore_watch: ['node_modules','src/audio','logs','.env'],
        log_file: 'logs/pm2.log'
    }]
};