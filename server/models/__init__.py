from .user import Base, User

# This line tells other Python files (like database.py) that if they import everything from this folder, 
# they should expect to get the Base class and the User class.
__all__ = ["Base", "User"]
