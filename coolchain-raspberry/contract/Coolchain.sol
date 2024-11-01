// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Coolchain {

    // Device record struct
    struct Record {
        address deviceAddress;
        int64 value;
        uint64 timestamp;
    }

    // Register auditor
    struct Auditor {
        address auditorAddress;
        bool active;
        string name;
        uint256 registerTimeStamp;
    }

    // Mapping to store auditors
    mapping (address => Auditor) private auditors;

    // Mapping to store all records by device address
    mapping (address => Record[]) private records;

    // Store device record
    function storeRecord(address deviceAddress, int64 value, uint64 timestamp) public returns (uint256) {
        verifyAuditor(msg.sender);
        Record memory record = Record({deviceAddress: deviceAddress, value: value, timestamp: timestamp});
        records[deviceAddress].push(record);
        return records[deviceAddress].length;
    }

    // Get device records by device address
    function getDeviceRecords(address deviceAddress) public view returns (Record[] memory) {
        //verifyAuditor(msg.sender);
        return records[deviceAddress];
    }

    // Register auditor
    function registerAuditor(address auditorAddress, string calldata name) public returns (Auditor memory) {
        Auditor memory auditor = Auditor({auditorAddress: auditorAddress, name: name, active: false, registerTimeStamp: 0 });
        if (auditors[auditorAddress].active) {
            auditor = auditors[auditorAddress];
        } else {
            auditor.active = true;
            auditor.registerTimeStamp = block.timestamp;
            auditors[auditorAddress] = auditor;
        }
        return auditor;
    }

    // Disable auditor
    function disableAuditor(address auditorAddress) public {
        require(auditors[auditorAddress].active, "Auditor not registered");
        Auditor memory auditor = auditors[auditorAddress];
        auditor.active = false;
        auditors[auditorAddress] = auditor;
    }

    // Get device records by device address
    function getAuditor(address auditorAddress) public view returns (Auditor memory) {
        require(auditors[auditorAddress].active, "Auditor not registered");
        return auditors[auditorAddress];
    }

    //Verify auditor is registered
    function verifyAuditor(address auditorAddress) public view returns (bool) {
        require(auditors[auditorAddress].active, "Auditor not registered");
        return true;
    }
}