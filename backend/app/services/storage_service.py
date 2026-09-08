import os
import shutil
from app.core.config import settings

class StorageService:
    def __init__(self):
        self.base_dir = settings.STORAGE_VAULT_DIR
        os.makedirs(self.base_dir, exist_ok=True)

    def save_evidence_file(self, case_id: str, evidence_id: str, original_filename: str, file_bytes: bytes) -> str:
        """
        Saves uploaded evidence binary file inside isolated case directory off-chain.
        Returns the relative or absolute storage path.
        """
        case_vault_dir = os.path.join(self.base_dir, "cases", case_id)
        os.makedirs(case_vault_dir, exist_ok=True)

        file_extension = os.path.splitext(original_filename)[1]
        stored_filename = f"{evidence_id}{file_extension}"
        target_path = os.path.join(case_vault_dir, stored_filename)

        with open(target_path, "wb") as f:
            f.write(file_bytes)

        return target_path

    def get_evidence_file_bytes(self, file_path: str) -> bytes:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Evidence file not found at path: {file_path}")
        with open(file_path, "rb") as f:
            return f.read()

storage_service = StorageService()
