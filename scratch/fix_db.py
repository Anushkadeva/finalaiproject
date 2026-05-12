import sqlite3
import os

db_path = 'd:/gpa1/instance/placement.db'
if not os.path.exists(db_path):
    db_path = 'd:/gpa1/placement.db'

print(f"Checking database at {db_path}")

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if password column exists
    cursor.execute("PRAGMA table_info(student)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if 'password' not in columns:
        print("Adding 'password' column to 'student' table...")
        cursor.execute("ALTER TABLE student ADD COLUMN password TEXT")
        conn.commit()
        print("Column added successfully.")
    else:
        print("'password' column already exists.")
        
    conn.close()
except Exception as e:
    print(f"Error: {e}")
