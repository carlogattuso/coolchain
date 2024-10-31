
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
    function storeRecord(address deviceAddress, int64 value, uint64 timestamp) public isDeviceRegistered(deviceAddress) returns (uint256) {
        Record memory record = Record({deviceAddress: deviceAddress, value: value, timestamp: timestamp});
        records[deviceAddress].push(record);
        return records[deviceAddress].length;
    }

    // Get device records by device address
    function getDeviceRecords(address deviceAddress) public view isDeviceRegistered(deviceAddress) returns (Record[] memory) {
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
    function registerDevice(address auditorAddress, address deviceAddress) public isAuditorRegistered(auditorAddress) isDeviceNew(deviceAddress) returns (Device memory) {
        Device memory device = Device({deviceAddress: deviceAddress});
        Auditor memory auditor = getAuditor(auditorAddress);

        // Register device for auditor
        devices[deviceAddress] = auditor;

        return device;
    }

    // Disable auditor
    function disableAuditor(address auditorAddress) public isAuditorRegistered(auditorAddress) {
        Auditor memory auditor = auditors[auditorAddress];
        auditor.active = false;
        auditors[auditorAddress] = auditor;
    }

    // Remove device
    function removeDevice(address deviceAddress) public isDeviceRegistered(deviceAddress) {
        Auditor memory emptyAuditor;
        devices[deviceAddress] = emptyAuditor;
    }

    // Get auditor with devices
    function getAuditor(address auditorAddress) public view isAuditorRegistered(auditorAddress) returns (Auditor memory) {
        return auditors[auditorAddress];
    }

    //Verify  auditor
    modifier isAuditorRegistered(address _auditorAddress){
        require(auditors[_auditorAddress].active == true, "Auditor is not registered");
        _;
    }

    //Verify device is registered for an auditor
    modifier isDeviceRegistered(address _deviceAddress) {
        require(devices[_deviceAddress].auditorAddress != address(0), "Device is not registered for any auditor");
        _;
    }

    //Verify device is not registered
    modifier isDeviceNew(address _deviceAddress) {
        require(devices[_deviceAddress].auditorAddress == address(0), "Device is already registered");
        _;
    }

    //Get empty device - auditor
    function getDevice(address deviceAddress) public view returns (Auditor memory) {
        return devices[deviceAddress];
    }
}