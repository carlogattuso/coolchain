# CoolChain Raspberry

This is a Node.js-based application designed to run on a Raspberry Pi. It collects and processes data from connected
sensors (e.g., temperature sensors) and interacts with an Ethereum-compatible blockchain to store and sign data
transactions.

This project is a submodule of the broader CoolChain ecosystem.

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Technologies Used](#technologies-used)
4. [Setup and Installation](#setup-and-installation)
5. [Running the Application](#running-the-application)
6. [Building the Application](#building-the-application)
7. [Common issues](#common-issues)

## Overview

CoolChain Raspberry is a lightweight application tailored for Raspberry Pi devices. It enables IoT functionalities such
as sensor data collection and processing. Additionally, it includes a wallet implementation for Ethereum-compatible
networks to securely sign transactions.

This project integrates seamlessly with other CoolChain modules:

- **CoolChain backend**: For centralized data processing and API interactions.
- **CoolChain contract**: A Solidity smart contract for decentralized storage of device and user data.

## Key Features

- **Sensor Data Collection**: Reads data from temperature sensors connected via GPIO or I2C interfaces.
- **Blockchain Integration**: Signs and stores data on an Ethereum-compatible blockchain.
- **Lightweight and Scalable**: Optimized for Raspberry Pi devices running ARM-based architectures.
- **Secure Wallet Management**: Uses `ethers` for wallet creation and transaction signing.

## Technologies Used

### Core Technologies

- **Language**: TypeScript
- **Framework**: Node.js (LTS version)
- **Package Manager**: npm

### Utilities

- **ethers** (v6.13.2): For Ethereum wallet and transaction handling.
- **dotenv**: For managing environment variables.

### Hardware

- **Raspberry Pi**: Compatible with models supporting Node.js.
- **Sensors**: Temperature sensors (e.g., DHT11, DHT22, or DS18B20).

## Setup and Installation

### Prerequisites

- A Raspberry Pi device with Node.js installed (v16 or later recommended).
- Access to the terminal or SSH for configuration.
- Connected temperature sensors compatible with the application.

### Install dependencies

```bash
npm install
```

### Configure environment variables

Set the local environment variables. Use .envExample, change it to .env (.env.dev) and set your own variables

## Running the Application

### Setup contract

```bash
npm run compile-contract
```

### Launch Application

```bash
# development
npm run start:raspy:dev

# production mode
npm run start:raspy
```

> **Note**: Running production mode from package.json will load environment variables from the project root

> **Note**: Rasperry wallet public key can be found in .wallet.json file

## Building the application

```bash
# development bundle
npm run build:raspy:dev

# production bundle
npm run build:raspy
```

> **Note**: Your production build can be found in the dist/ folder.

## Common Issues

Node.js Version Compatibility: Ensure you're running Node.js v16 or later.

Check your version with:

```bash
node -v
```