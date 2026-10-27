import bcrypt

def hash_password(plain_password: str) -> str:
    """
    Hashes a plain-text password using bcrypt with a generated salt.
    Never store raw passwords in the database!
    """
    # Convert string to bytes
    password_bytes = plain_password.encode("utf-8")
    # Generate random salt and hash password
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    # Decode back to string for storage in PostgreSQL
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Checks if a plain-text password matches the stored bcrypt hash.
    Returns True if valid, False otherwise.
    """
    password_bytes = plain_password.encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(password_bytes, hashed_bytes)
