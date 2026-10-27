from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from models.user import User
from schemas.user import UserLogin, UserRegister
from security import hash_password, verify_password


# Helper 1: Find a user by email
def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Search the database for a user matching the given email."""
    stmt = select(User).where(User.email == email)
    return db.scalar(stmt)


# Helper 2: Find a user by username
def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Search the database for a user matching the given username."""
    stmt = select(User).where(User.username == username)
    return db.scalar(stmt)


# Function A: Register a new user
def register_user(db: Session, user_data: UserRegister) -> User:
    """
    Registers a new user in the database:
    1. Checks if email is already taken.
    2. Checks if username is already taken.
    3. Hashes the password securely.
    4. Saves the new user to PostgreSQL.
    """
    # Step 1: Ensure email is unique
    if get_user_by_email(db, user_data.email):
        raise ValueError("An account with this email already exists.")

    # Step 2: Ensure username is unique
    if get_user_by_username(db, user_data.username):
        raise ValueError("This username is already taken.")

    # Step 3: Hash the plain-text password (NEVER save plain passwords)
    hashed_password = hash_password(user_data.password)

    # Step 4: Create new SQLAlchemy User object
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        password=hashed_password,
    )

    # Step 5: Save to database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)  # Reloads newly generated id and timestamps from PostgreSQL

    return new_user


# Function B: Authenticate / Login a user
def authenticate_user(db: Session, login_data: UserLogin) -> Optional[User]:
    """
    Verifies user login credentials:
    1. Looks up the user by email.
    2. Checks if the password matches the stored bcrypt hash.
    3. Returns the User if valid, or None if invalid.
    """
    # Step 1: Find user by email
    user = get_user_by_email(db, login_data.email)
    if not user:
        return None

    # Step 2: Check password
    if not verify_password(login_data.password, user.password):
        return None

    # Step 3: Success! Credentials are correct
    return user
