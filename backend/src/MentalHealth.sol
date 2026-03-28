// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MentalHealthAccess {

    mapping(address => bool) public authorized;

    struct Audit {
        uint time;
        address user;
        uint recordId;
        uint purpose;
        bool granted;
        bytes32 recordHash;
    }

    Audit[] public logs;

    function grantAccess(address user) public {
        authorized[user] = true;
    }

    function revokeAccess(address user) public {
        authorized[user] = false;
    }

    function canAccess(address user, uint, uint)
        public view returns (bool)
    {
        return authorized[user];
    }

    function logAccess(uint recordId, uint purpose, bytes32 recordHash) public {
        bool granted = authorized[msg.sender];

        logs.push(Audit({
            time: block.timestamp,
            user: msg.sender,
            recordId: recordId,
            purpose: purpose,
            granted: granted,
            recordHash: recordHash
        }));
    }

    function auditCount() public view returns (uint) {
        return logs.length;
    }

    function getAudit(uint index) public view returns (Audit memory) {
        return logs[index];
    }
}