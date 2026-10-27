# This script connects to the database and creates all tables defined in models

from database import engine
from models import Base

def create_all_tables():
    print("Connecting to database...")
    # This command checks the database and creates any table that does not exist yet
    Base.metadata.create_all(bind=engine)
    print("Success: All tables are created and ready!")

if __name__ == "__main__":
    create_all_tables()
