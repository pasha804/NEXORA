import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'nexora_dev.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute('ALTER TABLE profiles ADD COLUMN experience_data JSON')
    cursor.execute('ALTER TABLE profiles ADD COLUMN education_data JSON')
    cursor.execute('ALTER TABLE profiles ADD COLUMN projects_data JSON')
    conn.commit()
    print("Columns added successfully.")
except Exception as e:
    print(f"Error adding columns: {e}")
finally:
    conn.close()
