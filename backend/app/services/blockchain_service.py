import os
import json
from typing import Optional, Dict, Any
from web3 import Web3
from app.core.config import settings

class BlockchainService:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(settings.BLOCKCHAIN_RPC_URL))
        self.contract = None
        self.contract_address = None
        self.abi = None
        self._load_contract_info()

    def _load_contract_info(self):
        """Loads contract deployment info from shared artifacts if present."""
        shared_contract_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "../../../blockchain/shared/EvidenceLedger.json")
        )
        if os.path.exists(shared_contract_path):
            try:
                with open(shared_contract_path, "r") as f:
                    data = json.load(f)
                    self.contract_address = data.get("address")
                    self.abi = data.get("abi")
                    if self.contract_address and self.abi and self.w3.is_connected():
                        self.contract = self.w3.eth.contract(
                            address=Web3.to_checksum_address(self.contract_address),
                            abi=self.abi
                        )
            except Exception as e:
                print(f"[BlockchainService Warning] Failed loading shared contract file: {e}")

    def is_connected(self) -> bool:
        try:
            return self.w3.is_connected()
        except Exception:
            return False

    def register_evidence_on_chain(
        self,
        evidence_id_str: str,
        case_number: str,
        sha256_hash: str,
        storage_ref: str,
        custodian_wallet: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Registers evidence record on-chain. Returns receipt containing tx_hash & block_number.
        """
        evidence_bytes32 = Web3.keccak(text=evidence_id_str)
        custodian = Web3.to_checksum_address(custodian_wallet) if custodian_wallet else None

        if self.is_connected() and self.contract:
            try:
                accounts = self.w3.eth.accounts
                sender = accounts[0] if accounts else None
                if not custodian and sender:
                    custodian = sender

                tx_hash = self.contract.functions.registerEvidence(
                    evidence_bytes32,
                    case_number,
                    sha256_hash,
                    storage_ref,
                    custodian or sender
                ).transact({'from': sender})

                receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
                return {
                    "success": True,
                    "tx_hash": receipt.transactionHash.hex(),
                    "block_number": receipt.blockNumber,
                    "evidence_id_bytes32": evidence_bytes32.hex(),
                    "simulated": False
                }
            except Exception as e:
                print(f"[BlockchainService Error] Contract call failed: {e}")

        # Fallback simulation receipt when local node or wallet is offline
        simulated_tx = "0x" + Web3.keccak(text=f"SIMULATED_REG_{evidence_id_str}_{sha256_hash}").hex()
        return {
            "success": True,
            "tx_hash": simulated_tx,
            "block_number": 1,
            "evidence_id_bytes32": evidence_bytes32.hex(),
            "simulated": True
        }

    def transfer_custody_on_chain(
        self,
        evidence_id_str: str,
        to_custodian_wallet: str,
        reason: str,
        location: str
    ) -> Dict[str, Any]:
        evidence_bytes32 = Web3.keccak(text=evidence_id_str)
        to_custodian = Web3.to_checksum_address(to_custodian_wallet) if to_custodian_wallet.startswith("0x") else Web3.to_checksum_address("0x" + "0"*40)

        if self.is_connected() and self.contract:
            try:
                accounts = self.w3.eth.accounts
                sender = accounts[0] if accounts else None
                tx_hash = self.contract.functions.transferCustody(
                    evidence_bytes32,
                    to_custodian,
                    reason,
                    location
                ).transact({'from': sender})

                receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
                return {
                    "success": True,
                    "tx_hash": receipt.transactionHash.hex(),
                    "block_number": receipt.blockNumber,
                    "simulated": False
                }
            except Exception as e:
                print(f"[BlockchainService Transfer Error]: {e}")

        simulated_tx = "0x" + Web3.keccak(text=f"SIMULATED_TRANSFER_{evidence_id_str}").hex()
        return {
            "success": True,
            "tx_hash": simulated_tx,
            "block_number": 2,
            "simulated": True
        }

    def get_on_chain_evidence(self, evidence_id_str: str) -> Optional[Dict[str, Any]]:
        evidence_bytes32 = Web3.keccak(text=evidence_id_str)
        if self.is_connected() and self.contract:
            try:
                record = self.contract.functions.getEvidence(evidence_bytes32).call()
                # Record tuple: (evidenceId, caseNumber, sha256Hash, storageReference, submitter, currentCustodian, registrationTime, status, exists)
                if record[8]: # exists
                    return {
                        "evidenceId": record[0].hex(),
                        "caseNumber": record[1],
                        "sha256Hash": record[2],
                        "storageReference": record[3],
                        "submitter": record[4],
                        "currentCustodian": record[5],
                        "registrationTime": record[6],
                        "status": record[7],
                        "exists": record[8]
                    }
            except Exception as e:
                print(f"[BlockchainService Query Error]: {e}")
        return None

blockchain_service = BlockchainService()
