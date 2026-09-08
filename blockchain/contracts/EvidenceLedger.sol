// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EvidenceLedger
 * @notice Immutable ledger for registering digital evidence metadata, hashes, and chain-of-custody transfers.
 * @dev Files themselves are stored off-chain. Only SHA-256 hashes and custody history exist on-chain.
 */
contract EvidenceLedger {
    address public admin;

    enum EvidenceStatus { 
        Logged, 
        InCustody, 
        Transferred, 
        UnderAnalysis, 
        ProducedInCourt, 
        Archived, 
        Compromised 
    }

    struct TransferRecord {
        address fromCustodian;
        address toCustodian;
        string reason;
        string location;
        uint256 timestamp;
    }

    struct EvidenceRecord {
        bytes32 evidenceId;
        string caseNumber;
        string sha256Hash;
        string storageReference;
        address submitter;
        address currentCustodian;
        uint256 registrationTime;
        EvidenceStatus status;
        bool exists;
    }

    // Storage mappings
    mapping(bytes32 => EvidenceRecord) public evidenceRecords;
    mapping(bytes32 => TransferRecord[]) public custodyHistory;
    bytes32[] public allEvidenceIds;

    // Events
    event EvidenceRegistered(
        bytes32 indexed evidenceId,
        string caseNumber,
        string sha256Hash,
        string storageReference,
        address indexed submitter,
        address indexed currentCustodian,
        uint256 timestamp
    );

    event CustodyTransferred(
        bytes32 indexed evidenceId,
        address indexed fromCustodian,
        address indexed toCustodian,
        string reason,
        string location,
        uint256 timestamp
    );

    event StatusUpdated(
        bytes32 indexed evidenceId,
        EvidenceStatus newStatus,
        uint256 timestamp
    );

    event EvidenceVerified(
        bytes32 indexed evidenceId,
        bool isHashMatch,
        address indexed verifiedBy,
        uint256 timestamp
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "EvidenceLedger: Only admin authorized");
        _;
    }

    modifier evidenceExists(bytes32 _evidenceId) {
        require(evidenceRecords[_evidenceId].exists, "EvidenceLedger: Record does not exist");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /**
     * @notice Registers a new piece of evidence on-chain.
     */
    function registerEvidence(
        bytes32 _evidenceId,
        string memory _caseNumber,
        string memory _sha256Hash,
        string memory _storageReference,
        address _custodian
    ) external {
        require(!evidenceRecords[_evidenceId].exists, "EvidenceLedger: Evidence already registered");
        require(bytes(_sha256Hash).length == 64, "EvidenceLedger: SHA256 must be 64 hex characters");
        require(_custodian != address(0), "EvidenceLedger: Invalid custodian address");

        address initialCustodian = _custodian == address(0) ? msg.sender : _custodian;

        evidenceRecords[_evidenceId] = EvidenceRecord({
            evidenceId: _evidenceId,
            caseNumber: _caseNumber,
            sha256Hash: _sha256Hash,
            storageReference: _storageReference,
            submitter: msg.sender,
            currentCustodian: initialCustodian,
            registrationTime: block.timestamp,
            status: EvidenceStatus.Logged,
            exists: true
        });

        allEvidenceIds.push(_evidenceId);

        // Initial custody log entry
        custodyHistory[_evidenceId].push(TransferRecord({
            fromCustodian: address(0),
            toCustodian: initialCustodian,
            reason: "Initial Intake & Blockchain Registration",
            location: "Intake Vault",
            timestamp: block.timestamp
        }));

        emit EvidenceRegistered(
            _evidenceId,
            _caseNumber,
            _sha256Hash,
            _storageReference,
            msg.sender,
            initialCustodian,
            block.timestamp
        );
    }

    /**
     * @notice Transfers custody of an evidence file to another authorized address.
     */
    function transferCustody(
        bytes32 _evidenceId,
        address _toCustodian,
        string memory _reason,
        string memory _location
    ) external evidenceExists(_evidenceId) {
        require(_toCustodian != address(0), "EvidenceLedger: Invalid recipient address");
        require(
            msg.sender == evidenceRecords[_evidenceId].currentCustodian || msg.sender == admin,
            "EvidenceLedger: Only current custodian or admin can transfer"
        );

        address prevCustodian = evidenceRecords[_evidenceId].currentCustodian;
        evidenceRecords[_evidenceId].currentCustodian = _toCustodian;
        evidenceRecords[_evidenceId].status = EvidenceStatus.Transferred;

        custodyHistory[_evidenceId].push(TransferRecord({
            fromCustodian: prevCustodian,
            toCustodian: _toCustodian,
            reason: _reason,
            location: _location,
            timestamp: block.timestamp
        }));

        emit CustodyTransferred(
            _evidenceId,
            prevCustodian,
            _toCustodian,
            _reason,
            _location,
            block.timestamp
        );
    }

    /**
     * @notice Updates the operational status of an evidence record.
     */
    function updateStatus(
        bytes32 _evidenceId,
        EvidenceStatus _newStatus
    ) external evidenceExists(_evidenceId) {
        require(
            msg.sender == evidenceRecords[_evidenceId].currentCustodian || msg.sender == admin,
            "EvidenceLedger: Only current custodian or admin can update status"
        );

        evidenceRecords[_evidenceId].status = _newStatus;
        emit StatusUpdated(_evidenceId, _newStatus, block.timestamp);
    }

    /**
     * @notice Verifies an off-chain calculated SHA-256 hash against the on-chain recorded hash.
     */
    function verifyEvidenceHash(
        bytes32 _evidenceId,
        string memory _sha256HashToVerify
    ) external evidenceExists(_evidenceId) returns (bool matches) {
        bytes32 recordedHash = keccak256(abi.encodePacked(evidenceRecords[_evidenceId].sha256Hash));
        bytes32 inputHash = keccak256(abi.encodePacked(_sha256HashToVerify));
        
        matches = (recordedHash == inputHash);
        
        emit EvidenceVerified(_evidenceId, matches, msg.sender, block.timestamp);
        return matches;
    }

    /**
     * @notice View function to retrieve custody history log.
     */
    function getCustodyHistory(bytes32 _evidenceId) external view evidenceExists(_evidenceId) returns (TransferRecord[] memory) {
        return custodyHistory[_evidenceId];
    }

    /**
     * @notice View function to get total count of evidence registered.
     */
    function getEvidenceCount() external view returns (uint256) {
        return allEvidenceIds.length;
    }

    /**
     * @notice View function to get evidence record details.
     */
    function getEvidence(bytes32 _evidenceId) external view evidenceExists(_evidenceId) returns (EvidenceRecord memory) {
        return evidenceRecords[_evidenceId];
    }
}
