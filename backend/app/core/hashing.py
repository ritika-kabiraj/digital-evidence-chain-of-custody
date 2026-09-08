import hashlib

def calculate_sha256_from_bytes(file_bytes: bytes) -> str:
    """Calculates SHA-256 hash digest string from bytes."""
    sha256_hash = hashlib.sha256()
    sha256_hash.update(file_bytes)
    return sha256_hash.hexdigest()

def calculate_sha256_from_filepath(file_path: str, chunk_size: int = 65536) -> str:
    """Calculates SHA-256 hash digest string from a file path using streaming chunks."""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for block in iter(lambda: f.read(chunk_size), b""):
            sha256_hash.update(block)
    return sha256_hash.hexdigest()
