import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Step 1: Load environment variables from .env file
load_dotenv()

# Step 2: Read the database URL
DATABASE_URL = os.getenv("DATABASE_URL")

# Step 3: Create the database engine (connects SQLAlchemy to PostgreSQL)
engine = create_engine(DATABASE_URL)

# Step 4: Create a SessionLocal class
# Each instance of SessionLocal will be a single database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Step 5: Helper function to get database session in FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db #pause and then resume from where it was ended
    finally:
        db.close()
