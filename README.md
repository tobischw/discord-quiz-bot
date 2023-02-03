# Discord Quiz Bot

## 🚨 Discord Quiz Bot is WIP!

## Dockerfile Commands
1. docker build --tag discord-quiz-bot .
2. docker run -itd --network=host --restart=always discord-quiz-bot      

## How to Install/Run

1. Clone repo
2. `npm install`
3. Create a `config.json` file in the root directory of your bot with the following:

```json
{
    "clientId": "CLIENT_ID",
    "guildId": "GUILD_ID",
    "token": "TOKEN"
}
```

Replace appropriately. `clientId` is found on your Discord app's main page. `guildId` is the ID of the server you want to target (see [here](https://www.alphr.com/discord-find-server-id/) on how to find the guild ID). `token` is the token of the of bot.

Running it should be fairly easy. For first time setup, run `npm deploy-commands.js`. This will upload the commands to the Discord server. You only need to do this once, or if you change the command structure or add/delete commands. To actually start the server, run `npm index.js`. You should see "Bot ready" if everything is configured right!

## Creating Questions

Open `questions.json`. It is a JSON list of `Question`. The structure of a `Question` is the following:

```json
{
    "question": "What is the meaning of life?",
    "options": ["Nothing, life is meaningless", "42", "To chill, man, why are you asking me these questions?"],
    "answer": 1,
    "explanation": "C'est la vie!"
}
```

`answer` is the index of the correct option. Order counts here!
