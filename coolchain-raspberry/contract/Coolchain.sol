// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Coolchain {

    // Device record struct
    struct Record {
        address deviceAddress;
        int64 value;
        uint64 timestamp;
    }

    // Auditor struct
    struct Auditor {
        address auditorAddress;
        bool active;
        uint256 registerTimeStamp;
    }

    // Device struct
    struct Device {
        address deviceAddress;
    }

    // Mapping to store auditors
    mapping (address => Auditor) private auditors;

    // Mapping to store devices per auditor
    mapping (address => Auditor) private devices;

    // Mapping to store all records by device address
    mapping (address => Record[]) private records;

    // Store device record
    function storeRecord(address deviceAddress, int64 value, uint64 timestamp) public returns (uint256) {
        verifyDevice(deviceAddress);
        Record memory record = Record({deviceAddress: deviceAddress, value: value, timestamp: timestamp});
        records[deviceAddress].push(record);
        return records[deviceAddress].length;
    }

    // Get device records by device address
    function getDeviceRecords(address deviceAddress) public view returns (Record[] memory) {
        verifyDevice(deviceAddress);
        return records[deviceAddress];
    }

    // Register auditor
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

    // Register device
    function registerDevice(address auditorAddress, address deviceAddress) public returns (Device memory) {
        // Verify auditor
        verifyOrRegisterAuditor(auditorAddress);

        Device memory device = Device({deviceAddress: deviceAddress});

        // Check device is not registered and is not associated to the device
        require(devices[deviceAddress].auditorAddress == address(0), "Device is already registered");

        Auditor memory auditor = getAuditor(auditorAddress);

        // Register device for auditor
        devices[deviceAddress] = auditor;

        return device;
    }

    // Disable auditor
    function disableAuditor(address auditorAddress) public {
        require(auditors[auditorAddress].active, "Auditor not registered");
        Auditor memory auditor = auditors[auditorAddress];
        auditor.active = false;
        auditors[auditorAddress] = auditor;
    }

    // Get auditor with devices
    function getAuditor(address auditorAddress) public view returns (Auditor memory) {
        require(auditors[auditorAddress].active, "Auditor not registered");
        return auditors[auditorAddress];
    }

    //Verify or register auditor
    function verifyOrRegisterAuditor(address auditorAddress) public returns (bool) {
        if (auditors[auditorAddress].active == false) {
            registerAuditor(auditorAddress);
        }
        return true;
    }

    //Verify device is registered for an auditor
    function verifyDevice(address deviceAddress) public view returns (bool) {
        require(devices[deviceAddress].auditorAddress != address(0), "Device is not registered for any auditor");
        return true;
    }

    //Get empty device - auditor
    function getDevice(address deviceAddress) public view returns (Auditor memory) {
        return devices[deviceAddress];
    }

    //Get empty device - auditor
    function getDeviceAuditor(address deviceAddress) public view returns (address) {
        return devices[deviceAddress].auditorAddress;
    }
}