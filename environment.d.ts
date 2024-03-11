declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: string;

        CLIENT_ID: string;
        GUILD_ID: string;
        BOT_TOKEN: string;
        OWNER_USER_ID: string;

        WITAI_KEY: string;

        ORACLEDB_USER: string;
        ORACLEDB_PW: string;
        ORACLEDB_CONN_STR: string;
        UV_THREADPOOL_SIZE: number;
        ORACLEDB_POOL_MIN: number;
        ORACLEDB_POOL_MAX: number;

        MAIN_CHANNEL_ID: string;
        VOICE_LOG_CHANNEL_ID: string;
        STATUS_CHANNEL_ID: string;
        CASINO_CHANNEL_ID: string;
        NYT_CHANNEL_ID: string;
        FAT_ROLE_ID: string;
        LOTTERY_ROLE_ID: string;
    }
}