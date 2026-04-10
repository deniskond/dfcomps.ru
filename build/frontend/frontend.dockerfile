FROM node:24-alpine AS source
RUN apk add --no-cache --update python3 make g++
WORKDIR /opt/app
COPY decorate-angular-cli.js ./
COPY package*.json ./
RUN npm ci
COPY . .

FROM source AS builder
WORKDIR /opt/app
RUN npm run frontend:build
FROM nginx:1.25-bookworm AS dist
COPY /build/frontend/frontend-nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /opt/app/dist/apps/frontend /var/www/html
EXPOSE 80