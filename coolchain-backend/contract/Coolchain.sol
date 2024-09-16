// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Coolchain {

    // EIP712 domain separator
    struct EIP712Domain {
        string name;
        string version;
        uint256 chainId;
        address verifyingContract;
        bytes32 salt;
    }

    // Device record struct
    struct Record {
        bytes32 deviceId;
        uint8 value;
        uint64 timestamp;
    }

    // EIP712 domain separator hash
    bytes32 private DOMAIN_SEPARATOR;
    bytes32 private constant SALT = 0x5e75394f31cc39406c2d33d400bb0a9d15ede58611e895e36e6642881aa1cae6;

    mapping (bytes32 => Record[]) private records;
    
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
    function hashMessage(Record memory record) private pure returns (bytes32) {
        return keccak256(abi.encode(
            keccak256(bytes("Record(bytes32 deviceId,uint8 value,uint64 timestamp)")),
            record.deviceId, record.value, record.timestamp
        ));
    }

    // Verifies an EIP712 Record signature
    function verifyMessage(Record memory record, uint8 v, bytes32 r, bytes32 s) private view returns (bool) {
        bytes32 digest = keccak256(abi.encodePacked(
            "\x19\x01",
            DOMAIN_SEPARATOR,
            hashMessage(record)
        ));

        address recoveredAddress = ecrecover(digest, v, r, s);
        return (recoveredAddress == msg.sender);
    }

    // Device record
    function storeRecord(bytes32 deviceId, uint8 value, uint64 timestamp, uint8 v, bytes32 r, bytes32 s) public returns (uint256) {
        Record memory record = Record({deviceId: deviceId, value: value, timestamp: timestamp});
        require(verifyMessage(record, v, r, s), "Invalid signature");
        records[deviceId].push(record);
        return records[deviceId].length;
    }

    // Get device records
    function getDeviceRecords(bytes32 deviceId) public view returns (Record[] memory) {
        return records[deviceId];
    }

}