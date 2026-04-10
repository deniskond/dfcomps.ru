FROM node:24-alpine AS builder
RUN apk add --no-cache --update python3 make g++
WORKDIR /opt/app
COPY decorate-angular-cli.js ./
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run backend:build

FROM node:24-alpine
WORKDIR /opt/app
COPY --from=builder /opt/app/dist/apps/backend /opt/app
RUN npm i
CMD node /opt/app/main.js
EXPOSE 4001