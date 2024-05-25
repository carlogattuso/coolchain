// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract Coolchain {

    // EIP712 domain separator
    struct EIP712Domain {
        string name;
        string version;
        uint256 chainId;
        address verifyingContract;
        bytes32 salt;
    }

    // Sensor measurement struct
    struct Measurement {
        uint64 sensorId;
        uint8 value;
        uint64 timestamp;
    }

    // EIP712 domain separator hash
    bytes32 private DOMAIN_SEPARATOR;
    bytes32 private constant SALT = 0x5e75394f31cc39406c2d33d400bb0a9d15ede58611e895e36e6642881aa1cae6;

    mapping (uint64 => Measurement[]) private measurements;
    
    // EIP712 domain separator setup
    constructor() {
        DOMAIN_SEPARATOR = hashDomain(EIP712Domain({
            name: "coolchain",
            version: "1",
            chainId: block.chainid,
            verifyingContract: address(this),
            salt: SALT
        }));
    }

    // Hashes the EIP712 domain separator struct
    function hashDomain(EIP712Domain memory domain) private pure returns (bytes32) {
        return keccak256(abi.encode(
            keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)"),
            keccak256(bytes(domain.name)),
            keccak256(bytes(domain.version)),
            domain.chainId,
            domain.verifyingContract,
            domain.salt
        ));
    }

    // Hashes an EIP712 message struct
    function hashMessage(Measurement memory measurement) private pure returns (bytes32) {
        return keccak256(abi.encode(
            keccak256(bytes("Measurement(uint64 sensorId,uint8 value,uint64 timestamp)")),
            measurement.sensorId, measurement.value, measurement.timestamp
        ));
    }

    // Verifies an EIP712 measurement signature
    function verifyMessage(Measurement memory measurement, uint8 v, bytes32 r, bytes32 s) private view returns (bool) {
        bytes32 digest = keccak256(abi.encodePacked(
            "\x19\x01",
            DOMAIN_SEPARATOR,
            hashMessage(measurement)
        ));

        address recoveredAddress = ecrecover(digest, v, r, s);
        return (recoveredAddress == msg.sender);
    }

    // Sensor measurement
    function sendMeasurement(uint64 sensorId, uint8 value, uint64 timestamp, uint8 v, bytes32 r, bytes32 s) public returns (uint256) {
        Measurement memory measurement = Measurement({sensorId: sensorId, value: value, timestamp: timestamp});
        //require(verifyMessage(measurement, v, r, s), "Invalid signature");
        measurements[sensorId].push(measurement);
        return measurements[sensorId].length;
    }

    // Get sensor measurements
    function getSensorMeasurements(uint64 sensorId) public view returns (Measurement[] memory) {
        return measurements[sensorId];
    }

}