# syntax=docker/dockerfile:1
FROM node:20
WORKDIR /app
COPY . /app/
RUN yarn install && yarn build

ENTRYPOINT [ "node", "./build/src/server.mjs" ]
