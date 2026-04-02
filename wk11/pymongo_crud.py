from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

# Connect to MongoDB Atlas
uri = os.environ.get("MONGODB_URI")
client = MongoClient(uri, server_api=ServerApi('1'))
db = client["MauiBnB"]

# -------------------------
# 1. Create Customer Collection
# -------------------------

print("\n--- 1. Creating Customer Collection ---")
customer_collection = db["Customer"]
print("Customer collection created!")

# -------------------------
# 2. Delete All Records (Clean Up)
# -------------------------

print("\n--- 2. Deleting all existing records ---")
customer_collection.delete_many({})
print("All records deleted!")

# -------------------------
# 3. Insert Many - 3 Customer Records
# -------------------------

print("\n--- 3. Inserting 3 customers ---")
customers = [
    {"firstName": "Kai", "lastName": "Kahananui", "email": "kai.kahananui@hawaii.edu", "phone": "808-555-0101"},
    {"firstName": "Maya", "lastName": "Rosario", "email": "maya.rosario@hawaii.edu", "phone": "808-555-0102"},
    {"firstName": "Lena", "lastName": "Akana", "email": "lena.akana@hawaii.edu", "phone": "808-555-0103"}
]
result = customer_collection.insert_many(customers)
print(f"Inserted {len(result.inserted_ids)} customers!")

# -------------------------
# 4. Update Records
# -------------------------

print("\n--- 4. Updating records ---")
customer_collection.update_one(
    {"lastName": "Kahananui"},
    {"$set": {"email": "kai.updated@gmail.com"}}
)
print("Updated Kai's email!")

customer_collection.update_one(
    {"lastName": "Rosario"},
    {"$set": {"phone": "808-999-9999"}}
)
print("Updated Maya's phone!")

# -------------------------
# 5. Query Records
# -------------------------

print("\n--- 5. Querying records ---")
query_by_lastname = customer_collection.find_one({"lastName": "Akana"})
print(f"Query by last name 'Akana': {query_by_lastname}")

query_by_firstname = customer_collection.find_one({"firstName": "Kai"})
print(f"Query by first name 'Kai': {query_by_firstname}")

# -------------------------
# 6. Drop Collection
# -------------------------

print("\n--- 6. Dropping Customer Collection ---")
customer_collection.drop()
print("Customer collection dropped!")

client.close()
print("\nAll CRUD operations completed successfully!")
