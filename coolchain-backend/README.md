<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456

[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Setup local blockchain

```bash
$ docker pull moonbeamfoundation/moonbeam:latest

$ docker run -d --rm --name moonbeam_development -p 9944:9944 moonbeamfoundation/moonbeam:latest --dev --rpc-external --sealing 6000
```

## Prepare the contract

1. First set the Private Key of the deploying wallet in ./contract/.wallet.json

```bash
# 2. Access the contract folder

$ cd contract

# 3. Compile the contract

$ node compileContract

# 4. Deploy the contract

# development
$ node deployContract --dev

# test net mode
$ node deployContract
```

Save the contract address for future reference

## Set environment variables

Set the local environment variables. Use .envExample, change it to .env and set your own variables

## Database Installation

Follow these steps to setup the MongoDB local database environment

### Windows

#### Installation

1. [Install MongoDB client](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/#install-mongodb-community-edition-on-windows)
2. Add `yourPathToMongoDB\MongoDB\Server\yourVersion\bin` to PATH environment variable

> **Note**: When installing MongoDB, make sure to check that the database does not start as a service. To verify this,
> you need to
> go to the Windows Services and disable/deactivate it.
>
>`MongoDB Database Server (MongoDB)`

#### Initialisation

1. Create data folder

```bash
mkdir yourPathToCoolchain/coolchain/coolchain-backend/db/data
```

2. Create replica set

```bash
  Start-Process powershell -ArgumentList "-NoProfile -WindowStyle Hidden -Command `"mongod.exe --replSet rs0 --dbpath 'yourPathToCoolchain\coolchain\coolchain-backend\db\data' --port 27017 --bind_ip_all`""
```

> **Note**: To shutdown the current MongoDB process, you can use these two commands
>```bash
>  Get-Process mongod
>  Stop-Process -Name mongod
>```

3. [Install MongoDB Shell](https://www.mongodb.com/try/download/shell)
4. Initiate replica set transactions

```bash
  mongosh --port 27017
  rs.initiate()
```

5. Execute database initialisation scripts

```bash
  .\yourPathToCoolchain\coolchain\coolchain-backend\db\data\coolchain_db_seed.sh
```

6. Generate prisma scheme

```bash
  cd yourPathToCoolchain\coolchain\coolchain-backend\db
  prisma generate
```

## Linux

### Installation

1. Install MongoDB client

```bash
  brew tap mongodb/brew
  brew update
  brew install mongodb-community
```

### Initialisation

1. Create data folder

```bash
mkdir yourPathToCoolchain/coolchain/coolchain-backend/db/data
```

2. Create replica set

```bash
mongod --replSet rs0 --config /usr/local/etc/mongod.conf --dbpath yourPathToCoolchain/coolchain/coolchain-backend/db/data --port 27017 --bind_ip_all --fork
```

> **Note**: To shutdown the current MongoDB process, you can use these two commands
>```bash
>  ps aux | grep -v grep | grep mongod
>  kill <mongod pid>
>```

3. Initiate replica set transactions

```bash
  mongosh --port 27017
  rs.initiate()
```

4. Execute database initialisation scripts

```bash
  .\yourPathToCoolchain\coolchain\coolchain-backend\db\data\coolchain_db_seed.sh
```

5. Generate prisma scheme

```bash
  cd yourPathToCoolchain\coolchain\coolchain-backend\db
  prisma generate
```

## Regis Installation

Follow the steps in the documentation to [install and run Redis locally here](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/).

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If
you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
