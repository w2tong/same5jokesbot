# syntax=docker/dockerfile:1

FROM node:18-alpine

# see https://github.com/Automattic/node-canvas/issues/866
RUN apk add --no-cache --virtual .build-deps \
    build-base \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    && apk add --no-cache --virtual .runtime-deps \
    cairo \
    jpeg \
    pango \
    giflib \
    && npm ci

WORKDIR /same5jokesbot

COPY .env package.json ./
RUN npm install --omit=dev

RUN mkdir /same5jokesbot/dist
COPY dist/ ./dist

RUN mkdir /same5jokesbot/audio
COPY audio/ ./audio

RUN mkdir /same5jokesbot/img
COPY img/ ./img

CMD ["node", "dist/index.js"]