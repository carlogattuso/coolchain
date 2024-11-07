// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Coolchain {

    struct Record {
        address deviceAddress;
        int64 value;
        uint64 timestamp;
    }

    struct Auditor {
        address auditorAddress;
        bool active;
        uint256 registerTimeStamp;
    }

    struct Device {
        address deviceAddress;
    }

    mapping (address => Auditor) private auditors;
    mapping (address => address) private devices;
    mapping (address => Record[]) private records;

    function storeRecord(address deviceAddress, int64 value, uint64 timestamp)
        public
        isDeviceRegistered(deviceAddress)
        returns (uint256)
    {
        Record memory record = Record({deviceAddress: deviceAddress, value: value, timestamp: timestamp});
        records[deviceAddress].push(record);
        return records[deviceAddress].length;
    }

    function getDeviceRecords(address deviceAddress)
        public
        view
        isDeviceRegistered(deviceAddress)
        returns (Record[] memory)
    {
        return records[deviceAddress];
    }

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

    function disableAuditor(address auditorAddress) public isAuditorRegistered(auditorAddress) {
        Auditor memory auditor = auditors[auditorAddress];
        auditor.active = false;
        auditors[auditorAddress] = auditor;
    }

    function removeDevice(address deviceAddress) public isDeviceRegistered(deviceAddress) {
        devices[deviceAddress] = address(0);
    }

    function getAuditor(address auditorAddress) public view isAuditorRegistered(auditorAddress) returns (Auditor memory) {
        return auditors[auditorAddress];
    }

    modifier isAuditorRegistered(address _auditorAddress) {
        require(auditors[_auditorAddress].active == true, "Auditor is not registered");
        _;
    }

    modifier isDeviceRegistered(address _deviceAddress) {
        require(devices[_deviceAddress] != address(0), "Device is not registered for any auditor");
        _;
    }

    modifier isDeviceNew(address _deviceAddress) {
        require(devices[_deviceAddress] == address(0), "Device is already registered");
        _;
    }

    function getDevice(address deviceAddress) public view returns (address) {
        return devices[deviceAddress];
    }
}