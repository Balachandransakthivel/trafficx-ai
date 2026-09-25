# TRAFFICX AI — MongoDB Connection
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import os

client: Optional[AsyncIOMotorClient] = None
database = None


async def connect_to_mongo():
    global client, database
    mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    db_name = os.getenv("MONGODB_DB", "trafficx_ai")
    
    client = AsyncIOMotorClient(mongo_uri)
    database = client[db_name]
    
    # Create indexes
    await database["traffic_roads"].create_index("id", unique=True)
    await database["incidents"].create_index("id", unique=True)
    await database["emergency_vehicles"].create_index("id", unique=True)
    await database["traffic_signals"].create_index("id", unique=True)
    await database["routes"].create_index("id", unique=True)
    await database["vehicle_detections"].create_index("timestamp")
    await database["traffic_predictions"].create_index("timestamp")
    await database["alerts"].create_index("timestamp")
    
    print(f"Connected to MongoDB: {db_name}")


async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("MongoDB connection closed")


def get_database():
    return database