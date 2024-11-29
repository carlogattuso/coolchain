# Coolchain smart contract

## Overview

The `Coolchain.sol` smart contract is designed to manage and track temperature records coming from the end-user fleet of sensor devices. This contract has been deployed to the Moonbase Alpha TestNet.

## Features

- **Temperature monitoring:** Keeps track of temperature records for the end user.
- **Role management:** Registers end-users' wallet addresses in the auditors' list. Once registered, they can register their device addresses in the contract. Records are linked to devices.
## Prerequisites

- Node.js (v14.x or higher)
- npm
- Solidity (v0.8.x)

## Installation

**Install Dependencies:**
   ```sh
   npm install
   ```

## Environment variables

A wallet private key is needed to deploy the contract.

**Setup Your Wallet:**
   Create a file named `.wallet.json` and add your wallet private key. Use the file `.wallet.example.json` as a template. To obtain Moonbase DEVs on the Moonbase Alpha TestNet, use the following faucet: [Moonbeam Faucet](https://faucet.moonbeam.network).

## Compilation

To compile the `Coolchain.sol` contract, follow these steps:

**Compile the Contract:**
   ```sh
   npm run compile
   ```

## Deployment

Follow these steps to deploy `Coolchain.sol` to a local blockchain or a testnet:

**Deploy to Local Network:**
   For deploying on a local Moonbase development node, which should be listening on `http://localhost:9944`, run:

   ```sh
   npm run deploy:dev
   ```

**Deploy to Moonbase Alpha Testnet:**
   For deploying on a local Moonbase Alpha please run:

   ```sh
   npm run deploy
   ```

## Contract structure

### Data structures

#### `Record`

Represents a temperature record from a device.
- `address deviceAddress`: The address of the device that recorded the temperature.
- `int64 value`: The recorded temperature value.
- `uint64 timestamp`: The timestamp when the temperature was recorded.

#### `Auditor`

Represents an auditor in the system.
- `address auditorAddress`: The wallet address of the auditor.
- `bool active`: The active status of the auditor.
- `uint256 registerTimeStamp`: The timestamp when the auditor was registered.

#### `Device`

Represents a device registered by an auditor.
- `address deviceAddress`: The address of the device.

### Mappings

- `mapping(address => Auditor) private auditors`: Stores registered auditors.
- `mapping(address => address) private devices`: Maps a device address to its corresponding auditor address.
- `mapping(address => Record[]) private records`: Maps a device address to its recorded temperature records.

### Functions

#### `storeRecord`

Stores a temperature record for a registered device.

```solidity
function storeRecord(address deviceAddress, int64 value, uint64 timestamp)
    public
    isDeviceRegistered(deviceAddress)
    returns (uint256)
{
    Record memory record = Record({deviceAddress: deviceAddress, value: value, timestamp: timestamp});
    records[deviceAddress].push(record);
    return records[deviceAddress].length;
}
```

#### `getDeviceRecords`

Retrieves all temperature records for a registered device.

```solidity
function getDeviceRecords(address deviceAddress)
    public
    view
    isDeviceRegistered(deviceAddress)
    returns (Record[] memory)
{
    return records[deviceAddress];
}
```

#### `registerAuditor`

Registers a new auditor.

```solidity
function registerAuditor(address auditorAddress) public returns (Auditor memory) {
    Auditor memory auditor = Auditor({auditorAddress: auditorAddress, active: false, registerTimeStamp: 0 });
    if (auditors[auditorAddress].active) {
        auditor = auditors[auditorAddress];
    } else {
        auditor.active = true;
        auditor.registerTimeStamp = block.timestamp;
        auditors[auditorAddress] = auditor;
    }
    return auditor;
}
```

#### `registerDevice`

Registers a new device for a registered auditor.

```solidity
function registerDevice(address auditorAddress, address deviceAddress)
    public
    isAuditorRegistered(auditorAddress)
    isDeviceNew(deviceAddress)
    returns (Device memory)
{
    Device memory device = Device({deviceAddress: deviceAddress});
    devices[deviceAddress] = auditorAddress;
    return device;
}
```

#### `disableAuditor`

Disables a registered auditor.

```solidity
function disableAuditor(address auditorAddress) public isAuditorRegistered(auditorAddress) {
    Auditor memory auditor = auditors[auditorAddress];
    auditor.active = false;
    auditors[auditorAddress] = auditor;
}
```

#### `removeDevice`

Removes a registered device.

```solidity
function removeDevice(address deviceAddress) public isDeviceRegistered(deviceAddress) {
    devices[deviceAddress] = address(0);
}
```

#### `getAuditor`

Retrieves information about a registered auditor.

```solidity
function getAuditor(address auditorAddress) public view isAuditorRegistered(auditorAddress) returns (Auditor memory) {
    return auditors[auditorAddress];
}
```

#### `getDevice`

Retrieves the auditor address for a registered device.

```solidity
function getDevice(address deviceAddress) public view isDeviceRegistered(deviceAddress) returns (address) {
    return devices[deviceAddress];
}
```

### Modifiers

#### `isAuditorRegistered`

Ensures the auditor is registered and active.

```solidity
modifier isAuditorRegistered(address _auditorAddress) {
    require(auditors[_auditorAddress].active == true, "Auditor is not registered");
    _;
}
```

#### `isDeviceRegistered`

Ensures the device is registered.

```solidity
modifier isDeviceRegistered(address _deviceAddress) {
    require(devices[_deviceAddress] != address(0), "Device is not registered for any auditor");
    _;
}
```

#### `isDeviceNew`

Ensures the device is not already registered.

```solidity
modifier isDeviceNew(address _deviceAddress) {
    require(devices[_deviceAddress] == address(0), "Device is already registered");
    _;
}
```

## License

Solidity compiler (Solc) and ethers.js are licensed under the [MIT License](LICENSE).
