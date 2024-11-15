# CoolChain - Frontend

CoolChain is a frontend application built with **Next.js** and **NextUI**, designed to interact with the blockchain,
manage IoT devices, and store data in smart contracts. This project connects to the backend, allowing users to visualize
and manage their connected devices while leveraging blockchain technology for secure data storage.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Installation](#installation)
4. [Running the Application](#running-the-application)
5. [Building the Application](#building-the-application)
6. [Folder Structure](#folder-structure)
7. [License](#license)

## Overview

**CoolChain Frontend** is a web application that serves as the dashboard for managing IoT devices and their data. Users
can interact with smart contracts on the blockchain to register their devices and view data such as temperature, status,
and more.

Key features of the project include:

- **Blockchain Integration**: Interacts with smart contracts on blockchain networks like Moonbeam or Ethereum.
- **Real-Time Data Visualization**: Displays data from IoT devices through live charts.
- **MetaMask Authentication**: Allows user
- **Dark Mode & Light Mode**: Customizable user experience with both modes.

## Features

- **Blockchain Connectivity**: Interacts with smart contracts to store and retrieve device-related data.
- **Real-Time Dashboard**: Provides charts and graphs for real-time data visualization from devices.
- **IoT Device Management**: Users can register, view, and manage IoT devices linked to their accounts.
- **MetaMask Authentication**: Use MetaMask for Ethereum wallet integration and device management.
- **Dark Mode & Light Mode**: Switch between dark and light mode based on user preferences.
- **Account Page**: View registered devices and their associated data.

## Installation

### Install dependencies

```bash
npm install
```

### Configure environment variables

Set the local environment variables. Use .envExample, change it to .env (.env.dev) and set your own variables

## Running the Application

Once the dependencies are installed, you can start the development server to run the application locally.

### Start the Development Server

```bash
npm run dev
```

The application will be available at http://localhost:8081/.

## Building the Application

```bash
npm run build
```

> **Note**: Your production build can be found in the .next/ folder.

## Folder Structure

Here’s the basic folder structure of the project:

```
├── components
│ ├── auth # Components for the auth pages
│ ├── charts # Components for data charts
│ ├── devices # Components for the devices management
│ ├── errors # Components for error messages
│ ├── hooks # Custom hooks for functionality
│ ├── icons # Icons used in the interface
│ ├── layout # Layout design
│ ├── navbar # Navigation bar components
│ ├── records # Components for the records visualization
│ ├── sidebar # Sidebar components
│ ├── table # Table components
├── app # Pages of the application
│ ├── app # Route for managing devices and records
│ │ └── devices # Devices page
│ │ └── records # Records page
│ ├── auth # Main entry point of the auth module
│ │ └── signIn # Sign-in with Ethereum page
└── public # Static files like images and icons
```

## License

NextJS is licensed under the [MIT licensed](LICENSE).
