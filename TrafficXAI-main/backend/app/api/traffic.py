# TRAFFICX AI — Traffic API
from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
import random

from app.models.traffic import TrafficRoad, TrafficStatus, COLLECTIONS
from app.database.mongodb import get_database
from app.websocket.manager import broadcast_traffic_update

router = APIRouter()


@router.get("/roads", response_model=List[TrafficRoad])
async def get_roads():
    db = get_database()
    if db is None:
        return get_mock_roads()
    roads = await db[COLLECTIONS["roads"]].find().to_list(100)
    return [TrafficRoad(**r) for r in roads]


@router.get("/roads/{road_id}", response_model=TrafficRoad)
async def get_road(road_id: str):
    db = get_database()
    if db is None:
        roads = get_mock_roads()
        for r in roads:
            if r.id == road_id:
                return r
        raise HTTPException(status_code=404, detail="Road not found")
    road = await db[COLLECTIONS["roads"]].find_one({"id": road_id})
    if not road:
        raise HTTPException(status_code=404, detail="Road not found")
    return TrafficRoad(**road)


@router.post("/roads", response_model=TrafficRoad)
async def create_road(road: TrafficRoad):
    db = get_database()
    if db is None:
        return road
    await db[COLLECTIONS["roads"]].insert_one(road.dict())
    await broadcast_traffic_update({"type": "road_created", "data": road.dict()})
    return road


@router.put("/roads/{road_id}", response_model=TrafficRoad)
async def update_road(road_id: str, road: TrafficRoad):
    db = get_database()
    if db is None:
        return road
    road.timestamp = datetime.utcnow()
    await db[COLLECTIONS["roads"]].replace_one({"id": road_id}, road.dict())
    await broadcast_traffic_update({"type": "road_updated", "data": road.dict()})
    return road


@router.post("/simulate/traffic-surge")
async def simulate_traffic_surge():
    """Simulate traffic surge on a random road"""
    db = get_database()
    roads = get_mock_roads()
    target_road = random.choice(roads)
    target_road.vehicle_count = random.randint(45, 60)
    target_road.density = min(100, round((target_road.vehicle_count / 50) * 100))
    target_road.status = TrafficStatus.CRITICAL
    target_road.timestamp = datetime.utcnow()
    
    if db:
        await db[COLLECTIONS["roads"]].replace_one({"id": target_road.id}, target_road.dict())
    
    await broadcast_traffic_update({"type": "traffic_surge", "data": target_road.dict()})
    return {"message": "Traffic surge simulated", "road": target_road}


def get_mock_roads() -> List[TrafficRoad]:
    return [
        TrafficRoad(
            id="R1", name="Avinashi Road",
            vehicle_count=38, density=82, status=TrafficStatus.CRITICAL,
            lat=11.0136, lng=77.0247,
            from_lat=11.0168, from_lng=77.0061,
            to_lat=11.0104, to_lng=77.0432,
        ),
        TrafficRoad(
            id="R2", name="DB Road",
            vehicle_count=22, density=51, status=TrafficStatus.HIGH,
            lat=10.9978, lng=76.9880,
            from_lat=11.0005, from_lng=76.9691,
            to_lat=10.9951, to_lng=77.0069,
        ),
        TrafficRoad(
            id="R3", name="Trichy Road",
            vehicle_count=12, density=28, status=TrafficStatus.MEDIUM,
            lat=10.9852, lng=77.0200,
            from_lat=10.9951, from_lng=77.0069,
            to_lat=10.9752, to_lng=77.0330,
        ),
        TrafficRoad(
            id="R4", name="Mettupalayam Road",
            vehicle_count=7, density=16, status=TrafficStatus.LOW,
            lat=11.0087, lng=76.9876,
            from_lat=11.0168, from_lng=77.0061,
            to_lat=11.0005, to_lng=76.9691,
        ),
        TrafficRoad(
            id="R5", name="NH Road",
            vehicle_count=28, density=64, status=TrafficStatus.HIGH,
            lat=11.0028, lng=77.0251,
            from_lat=11.0104, from_lng=77.0432,
            to_lat=10.9951, to_lng=77.0069,
        ),
    ]