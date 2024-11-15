<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

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
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
<a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>

# CoolChain Backend

The CoolChain backend is a server-side application built using [NestJS](https://nestjs.com/) and TypeScript. It serves
as the core of the CoolChain ecosystem, handling business logic, database interactions, and API endpoints.

## Table of Contents

1. [Description](#description)
2. [Technologies Used](#technologies-used)
3. [Setup and Installation](#setup-and-installation)
4. [Running the Application](#running-the-application)
5. [Building the Application](#building-the-application)
6. [Testing](#testing)
7. [Support](#support)
8. [License](#license)

## Description

The backend is responsible for managing business logic, interacting with MongoDB, and connecting to Ethereum-compatible
networks via a smart contract.

## Technologies Used

- **Language**: TypeScript
- **Framework**: [NestJS](https://nestjs.com)
- **Database**: MongoDB with Prisma as ORM
- **Blockchain**: Ethereum-compatible smart contract interaction
- **Testing**: Jest, ts-jest
- **Task Queues**: BullMQ for job scheduling

## Setup and Installation

### Install Dependencies

```bash
npm install
```

### Setup local blockchain (optional)

```bash
docker pull moonbeamfoundation/moonbeam:latest

docker run -d --rm --name moonbeam_development -p 9944:9944 moonbeamfoundation/moonbeam:latest --dev --rpc-external --sealing 6000
```

### Configure environment variables

Set the local environment variables. Use .envExample, change it to .env (.env.dev) and set your own variables

### Database Installation

Follow these steps to setup the MongoDB local database environment

#### Install MongoDB client

```bash
brew tap mongodb/brew
brew update
brew install mongodb-community
```

#### Create the Replica Set**

Initialize the MongoDB replica set to enable replication and data consistency.

```bash
cd db
./coolchain_db_start_locally.sh
```

> **Note**: To stop the current MongoDB process, use the following command:
> ```bash
> cd db
> ./coolchain_db_stop_locally.sh
> ```

#### Seed the Database

Populate the database with the required collections and initial data versions.

```bash
cd db
./coolchain_db_seed.sh
```

#### Generate the Prisma Schema

Generate the Prisma client based on the database schema.

```bash
cd db
prisma generate
```

### Redis Installation

Follow the steps in the documentation
to [install and run Redis locally here](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/).

---

## Running the application

### Setup contract

```bash
npm run compile-contract
```

### Launch NestJS App

```bash
# development
npm run start:backend:dev

# watch mode
npm run start:backend:debug

# production mode
npm run start:backend:prod
```

> **Note**: Running production mode from package.json will load environment variables from the project root

## Building the application

```bash
npm run build:backend
```

> **Note**: Your production build can be found in the dist/ folder.

## Testing

```bash
# unit tests
npm run test

# e2e
npm run test:e2e

# coverage
npm run test:cov
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
