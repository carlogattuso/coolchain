// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Coolchain {

    // Device record struct
    struct Record {
        address deviceAddress;
        int64 value;
        uint64 timestamp;
    }

    // Mapping to store all records by device address
    mapping (address => Record[]) private records;

    // Store device record
    function storeRecord(address deviceAddress, int64 value, uint64 timestamp) public returns (uint256) {
        Record memory record = Record({deviceAddress: deviceAddress, value: value, timestamp: timestamp});
        records[deviceAddress].push(record);
        return records[deviceAddress].length;
    }

    // Get device records by device address
    function getDeviceRecords(address deviceAddress) public view returns (Record[] memory) {
        return records[deviceAddress];
    }

}