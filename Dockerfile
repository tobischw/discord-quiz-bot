# syntax=docker/dockerfile:1
FROM node:16.18.1

COPY ./ /discord-quiz-bot
WORKDIR /discord-quiz-bot

RUN npm install -g npm@9.4.1 --omit-dev
RUN node deploy-commands.js
CMD ["node", "index.js"]