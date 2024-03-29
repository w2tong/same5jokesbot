import winston from 'winston';

const format = winston.format.printf(({ timestamp, level, message, stack }) => {
    return `[${timestamp}] ${level}: ${message}\n${stack}`;
});

const loggerOptions = {
    level: 'error',
    format: winston.format.combine(
        // winston.format.errors({ stack: true }),
        winston.format.timestamp({
            format: 'MMM-DD-YYYY HH:mm:ss',
        }),
        format
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' })
    ]
};
const logger = winston.createLogger(loggerOptions);

function logError(err: unknown) {
    if (err instanceof Error) {
        logger.error({ message: `${err.message}`, stack: err.stack });
    }
    else {
        logger.error({ message: `${err}` });
    }
}

export { logger, logError };