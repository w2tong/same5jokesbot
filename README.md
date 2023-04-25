# Same5JokesBot
Discord bot that says the same 5 jokes.

## Installation
### .env File
Place .env file in the root directory
```
# Discord
CLIENT_ID=Bot Client ID
GUILD_ID=Guild ID
BOT_TOKEN=Bot Token

# Wit AI
WITAI_KEY=Wit Ai Client Access Token

# Oracle DB
ORACLEDB_USER=username
ORACLEDB_PW=password
ORACLEDB_CONN_STR=connection string

# Wholesome Sisters
MAIN_CHANNEL_ID=text channel id
VOICE_LOG_CHANNEL_ID=text channel id
```

### Setting up Oracle DB
Install Oracle Instant Client for your environment<br/>
https://www.oracle.com/database/technologies/instant-client.html

### Setting up [wit.ai](https://wit.ai/)
1. Create a [wit.ai](https://wit.ai/) account by logging into Facebook. and create a new app. 
2. Create a new app.
3. Navigate to Manangement > Settings and copy the "Client Access Token" into your .env file.

## Deployment
### Run in dev
```shell
npm run dev
```

### Run in prod
```shell
npm start
```

### Deploy slash commands to server
```shell
src/node deploy-commands.ts
```
