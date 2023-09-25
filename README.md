# Dfcomps.ru

This is a repository for storing everything related to dfcomps.ru site, which is dedicated to hosting Quake III Defrag tournaments. Feel free to contribute or just join our awesome community and send your demos :)

# Quick start

The repository consists of several applications which are managed by [Nx Workspaces](https://nx.dev/). Every app is written in Typescript, recommended version of NodeJS is 18.x. To develop backend locally, you need to install Docker for working with database and migrations. Before running any projects locally, you need to install npm packages: 

```bash
npm i
```

## Frontend

Main site frontend written in Angular. To start frontend project locally:

```bash
npm run frontend
```

By default, frontend is using backend from main dfcomps.ru site, to switch to local backend use

```bash
npm run frontend-local
```

Connection to different backends is managed in [url-params.config](https://github.com/deniskond/dfcomps.ru/blob/master/apps/frontend/src/shared/rest-api/business/url-params.config.ts#L5) and also in proxy.conf files ([prod](https://github.com/deniskond/dfcomps.ru/blob/master/apps/frontend/proxy.conf.json) and [local](https://github.com/deniskond/dfcomps.ru/blob/master/apps/frontend/proxy.conf.local.json))

## Database

There is a [PostgreSQL](https://www.postgresql.org/) database using [Liquibase](https://www.liquibase.org/) for migrations and [PgAdmin](https://www.pgadmin.org/) for database management. To setup database make sure [Docker](https://www.docker.com/) is installed and running, then execute this script once:

```bash
npm run database:setup
```

After that, you will have PostgreSQL working on port 5432 with test database and PgAdmin working on port 4004. To access database via PgAdmin:
- Open PgAdmin frontend http://localhost:4004
- Login as test user Login: admin@admin.com, Password: admin
- Right click on Servers -> Register -> Server
- Input any name at General tab
- At Connection tab input this fields:
```bash
Host name/address: local_pgdb
Port: 5432
Maintenance database: postgres
Username: user
Password: admin
```
- After clicking save you should be able to access dfcomps test database

Liquibase migrations use separate docker container to generate local database diff by running

```bash
npm run database:generate-migrations
```

After that, a file `build/database/dfcomps.changelog.json` is generated with migrations, which will be then applied to production database. Don't forget to run migrations and commit changelog file if you made any changes to database structure.
There is also an image of database `build/database/dev-database.tar` which stores database with test data. This file is also updated on running `npm run database:generate-migrations` script and also need to be committed.

## Backend

Main site backend written in NestJS. To start backend project locally you need to first ensure that you have local version of database initialized (as described in previous section). Start script:

```bash
npm run backend
```

## 1v1 Server
Websocket server specially designed for 1v1 pick/bans and matchmaking. Written in pure Typescript using [Express](https://expressjs.com/). To start server locally:

```bash
npm run 1v1-server
```

Websocket interaction between client and server is pretty complex, so there is 100% coverage of all use cases by end-to-end tests. Make sure that all new functionality also is covered by end-to-end tests and all tests are passing by running:

```bash
npm run 1v1-server:test
```

## Discord bot
Designed to bring some dfcomps functionality to discord channels. Currently is not used and is in deprecated state. To run locally:

```bash
npm run discord-bot
```

# Server scheme

Everything related to server scheme is stored in `build` folder, main part of which is `build/base-nginx.conf`. Visual interpretation of nginx config and server scheme:
![dfcomps server](docs/dfcomps-server.png)
