# Same5JokesBot
Same5JokesBot is a discord bot written TypeScript using the discord.js library. Same5JokesBot contains jokes specifically for the Wholesome Sisters discord server.
## Features
- Text commands to get text responses or play audio
- Voice commands using [wit.ai](https://wit.ai/)
- Users stats
  - Number of uses for slash commands and playing audio
  - Time spent in voice channels
- Reminders for users

## Installation

### Install dependencies
```shell
npm i
```

### Setting up [wit.ai](https://wit.ai/) for Voice Recognition
1. Create a [wit.ai](https://wit.ai/) account by logging into Facebook. and create a new app. 
2. Create a new app.
3. Navigate to Manangement > Settings and copy the "Client Access Token" into your .env file.

### .env File
Place .env file in the root directory
```
NODE_ENV=your environment

# Discord
CLIENT_ID=Bot Client ID
GUILD_ID=Guild ID
BOT_TOKEN=Bot Token
OWNER_USER_ID=your user id

# Wit AI
WITAI_KEY=Wit Ai Client Access Token

# Oracle DB
ORACLEDB_USER=username
ORACLEDB_PW=password
ORACLEDB_CONN_STR=connection string
UV_THREADPOOL_SIZE=4
ORACLEDB_POOL_MIN=1
ORACLEDB_POOL_MAX=4

# Wholesome Sisters
MAIN_CHANNEL_ID=text channel id
VOICE_LOG_CHANNEL_ID=text channel id
STATUS_CHANNEL_ID=status channel id
CASINO_CHANNEL_ID=casino channel id
FAT_ROLE_ID=fat role id
LOTTERY_ROLE_ID=lottery role id
```

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
npm run deploy
```

## GitHub Action secrets for PM2 deployment
SSH_KNOWN_HOSTS=ip address
SSH_PRIVATE_KEY=private key
SSH_USER=username

## GitHub Action deployment on Ubuntu using NVM
```
sudo ln -s /home/ubuntu/.nvm/versions/node/${NODE_VERSION}/bin/node /usr/local/bin/node
sudo ln -s /home/ubuntu/.nvm/versions/node/${NODE_VERSION}/bin/npm /usr/local/bin/npm
sudo ln -s /home/ubuntu/.nvm/versions/node/${NODE_VERSION}/bin/npx /usr/local/bin/npx
sudo ln -s /home/ubuntu/.nvm/versions/node/${NODE_VERSION}/bin/pm2 /usr/local/bin/pm2
```