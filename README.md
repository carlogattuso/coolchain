# CoolChain

This project includes a variety of frameworks, libraries, and tools to create a robust and scalable application. It is structured into four subprojects:

1. **CoolChain backend**: The main application.
2. **CoolChain web**: The front-end application built with React.
3. **CoolChain Raspberry**: A Node.js based application to run on a Raspberry Pi.
4. **CoolChain contract**: A smart contract written in Solidity.

Below is an overview of the key components and packages used in this project.

## Table of Contents

- [Subprojects](#subprojects)
- [Technologies Used](#technologies-used)

## Subprojects

### CoolChain backend

The backend of the application, built with NestJS and TypeScript. This handles business logic, database interactions, and API endpoints.

### CoolChain web

The frontend of the application, built with React. It is used by end users to manage their fleet of devices and register them under their account. Login is performed with MetaMask. The user's wallet address is registered in the CoolChain contract along with their devices.

### CoolChain Raspberry

A Node.js based application designed to run on a Raspberry Pi. This collects and processes data from temperature sensors connected to the Raspberry Pi. This also holds an Ethereum-compatible wallet created with ethers to sign records transactions.

### CoolChain contract

A smart contract written in Solidity that manages the registration of user wallet addresses and interactions with the blockchain. This contract was developed using Remix and deployed on the Moonbeam Alpha Test network. User wallet address and the associated devices are registered in the contract. They are check when storing temperature records using modifiers.

## Technologies Used

### CoolChain backend

- **Language**: TypeScript (v5.6.2)
- **Framework**: NestJS (`@nestjs/common`, `@nestjs/core`, etc.)
- **Database**:
  - MongoDB (v6.9.0) via `mongodb` package
  - Prisma as ORM
- **Testing**:
  - Jest (v29.7.0) for unit tests
  - `ts-jest` for running TypeScript tests
- **Utilities**:
  - BullMQ for job queues

### CoolChain web

- **Language**: TypeScript
- **Framework**:  Next.js (14.2.13) and React (v18.3.1)
- **Utilities**:
  - SWR (2.2.5) for requests to the backend REST API
- **Authentication**:
  - MetaMask for login
- **Ethereum**:
  - User's public wallet address is registered in the CoolChain contract

### CoolChain Raspberry

- **Language**: TypeScript
- **Framework**: Node.js
- **Utilities**:
  - ethers (v6.13.2) for creating an Ethereum compatible wallet to sign records transactions

### CoolChain contract

- **Language**: Solidity
- **Development**: Remix IDE
- **Deployment**: Can be deployed on the Moonbeam network
