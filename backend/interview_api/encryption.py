"""
Encryption utilities for sensitive data
"""
import os
import json
from cryptography.fernet import Fernet
from django.conf import settings


def get_encryption_key():
    """Get or generate encryption key from settings"""
    key = os.getenv('ENCRYPTION_KEY')
    if not key:
        # Generate from SECRET_KEY (deterministic)
        from django.utils.encoding import force_bytes
        import base64
        import hashlib
        
        secret = force_bytes(settings.SECRET_KEY)
        key_material = hashlib.sha256(secret).digest()
        key = base64.urlsafe_b64encode(key_material)
    else:
        key = key.encode()
    
    return key


def encrypt_data(data: dict) -> str:
    """
    Encrypt dictionary to encrypted string
    """
    fernet = Fernet(get_encryption_key())
    json_str = json.dumps(data, ensure_ascii=False)
    encrypted_bytes = fernet.encrypt(json_str.encode('utf-8'))
    return encrypted_bytes.decode('utf-8')


def decrypt_data(encrypted_str: str) -> dict:
    """
    Decrypt encrypted string to dictionary
    """
    fernet = Fernet(get_encryption_key())
    decrypted_bytes = fernet.decrypt(encrypted_str.encode('utf-8'))
    json_str = decrypted_bytes.decode('utf-8')
    return json.loads(json_str)

