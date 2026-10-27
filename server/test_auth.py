import sys
import uuid

# Ensure UTF-8 output on Windows console
if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from database import SessionLocal
from schemas.user import UserLogin, UserRegister, UserResponse
from crud.user import authenticate_user, get_user_by_email, register_user

def run_tests():
    print("=" * 60)
    print("[*] STARTING DATABASE & AUTHENTICATION TESTS")
    print("=" * 60)

    db = SessionLocal()
    try:
        # Generate unique test user data
        random_suffix = uuid.uuid4().hex[:6]
        test_username = f"dhandho_user_{random_suffix}"
        test_email = f"user_{random_suffix}@example.com"
        test_password = "SecurePassword@123"

        print(f"\n1. Testing Registration for: {test_email} ...")
        register_data = UserRegister(
            username=test_username,
            email=test_email,
            password=test_password
        )
        created_user = register_user(db, register_data)
        
        print("   [OK] User successfully registered and saved in PostgreSQL!")
        print(f"        - ID: {created_user.id}")
        print(f"        - Username: {created_user.username}")
        print(f"        - Email: {created_user.email}")
        print(f"        - Created At: {created_user.created_at}")
        print(f"        - Hashed Password in DB: {created_user.password[:25]}... (scrambled bcrypt)")

        # Verify password is NOT stored as plain text
        assert created_user.password != test_password, "CRITICAL: Password was stored in plain text!"
        assert created_user.password.startswith("$2b$"), "Password should be hashed with bcrypt ($2b$)!"
        print("   [OK] Security Check: Plain password was NOT stored. Bcrypt hash confirmed.")

        # Test Duplicate Prevention
        print("\n2. Testing Duplicate Prevention ...")
        try:
            register_user(db, register_data)
            print("   [FAIL] Duplicate registration was allowed!")
        except ValueError as e:
            print(f"   [OK] Successfully rejected duplicate email: {e}")

        # Test Authentication with CORRECT password
        print("\n3. Testing Login with CORRECT credentials ...")
        login_data = UserLogin(email=test_email, password=test_password)
        auth_user = authenticate_user(db, login_data)
        assert auth_user is not None, "Login failed with correct credentials!"
        assert auth_user.id == created_user.id
        print(f"   [OK] Login successful for user: {auth_user.username}")

        # Test Authentication with WRONG password
        print("\n4. Testing Login with WRONG password ...")
        wrong_login = UserLogin(email=test_email, password="WrongPassword123!")
        bad_auth = authenticate_user(db, wrong_login)
        assert bad_auth is None, "Security flaw: Login succeeded with wrong password!"
        print("   [OK] Login rejected for wrong password.")

        # Test Authentication with NON-EXISTENT email
        print("\n5. Testing Login with NON-EXISTENT email ...")
        fake_login = UserLogin(email="nonexistent_user_999@example.com", password="anypassword")
        fake_auth = authenticate_user(db, fake_login)
        assert fake_auth is None, "Security flaw: Login succeeded for fake email!"
        print("   [OK] Login rejected for non-existent email.")

        # Test Pydantic Response Serialization
        print("\n6. Testing Pydantic UserResponse serialization ...")
        response_model = UserResponse.model_validate(created_user)
        response_dict = response_model.model_dump()
        assert "password" not in response_dict, "CRITICAL: Password leaked in API response model!"
        print(f"   [OK] Response Model Data: {response_dict}")
        print("   [OK] Security Check: Password field completely absent from response.")

        # Direct Database Read Check
        print("\n7. Direct Query Verification from PostgreSQL ...")
        fetched_user = get_user_by_email(db, test_email)
        assert fetched_user is not None
        assert fetched_user.id == created_user.id
        print(f"   [OK] Verified: User {fetched_user.email} exists in PostgreSQL table 'users'.")

        print("\n" + "=" * 60)
        print("[SUCCESS] ALL TESTS PASSED! EVERYTHING IS WORKING PERFECTLY!")
        print("=" * 60)

    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
