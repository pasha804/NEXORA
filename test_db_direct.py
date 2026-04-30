import os
from sqlalchemy import create_engine, text, inspect
from common.models import Base

db_url = os.environ.get("DATABASE_URL")
print(f"Testing DB: {db_url}")
engine = create_engine(db_url)

try:
    with engine.connect() as conn:
        res = conn.execute(text("SELECT current_database(), current_schema(), current_user")).fetchone()
        print(f"Connection Info: {res}")
        
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"Tables in 'public': {tables}")
        
        # Check if profiles is in any schema
        schemas = inspector.get_schema_names()
        print(f"Schemas: {schemas}")
        for schema in schemas:
            stables = inspector.get_table_names(schema=schema)
            if "profiles" in stables:
                print(f"Found 'profiles' in schema: {schema}")

except Exception as e:
    print(f"Error: {e}")
