# TRAFFICX AI — Routes API
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime

from app.models.traffic import Route, TrafficStatus, COLLECTIONS
from app.database.mongodb import get_database
from app.services.route_service import calculate_optimal_route, get_all_routes
from app.websocket.manager import broadcast_route_update

router = APIRouter()


@router.get("/", response_model=List[Route])
async def get_routes():
    db = get_database()
    if db is None:
        return get_mock_routes()
    routes = await db[COLLECTIONS["routes"]].find().to_list(100)
    return [Route(**r) for r in routes]


@router.get("/{route_id}", response_model=Route)
async def get_route(route_id: str):
    db = get_database()
    if db is None:
        routes = get_mock_routes()
        for r in routes:
            if r.id == route_id:
                return r
        raise HTTPException(status_code=404, detail="Route not found")
    route = await db[COLLECTIONS["routes"]].find_one({"id": route_id})
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    return Route(**route)


@router.post("/calculate")
async def calculate_route(
    start_lat: float,
    start_lng: float,
    end_lat: float,
    end_lng: float,
    avoid_incidents: bool = True,
    priority: str = "EMERGENCY"
):
    """Calculate optimal route between two points"""
    route = await calculate_optimal_route(
        start_lat, start_lng, end_lat, end_lng,
        avoid_incidents=avoid_incidents,
        priority=priority
    )
    return route


@router.post("/{route_id}/select")
async def select_route(route_id: str):
    """Mark a route as selected/recommended"""
    db = get_database()
    if db is None:
        return {"message": "Route selected (mock)"}
    
    # Unset other routes
    await db[COLLECTIONS["routes"]].update_many(
        {}, {"$set": {"recommended": False}}
    )
    
    # Set this route as recommended
    await db[COLLECTIONS["routes"]].update_one(
        {"id": route_id}, {"$set": {"recommended": True, "timestamp": datetime.utcnow()}}
    )
    
    route = await db[COLLECTIONS["routes"]].find_one({"id": route_id})
    await broadcast_route_update({"type": "route_selected", "data": route})
    
    return {"message": "Route selected", "route": route}


@router.get("/compare/all")
async def compare_all_routes(
    start_lat: float,
    start_lng: float,
    end_lat: float,
    end_lng: float
):
    """Get comparison of all available routes"""
    routes = await get_all_routes(start_lat, start_lng, end_lat, end_lng)
    return {"routes": routes}


def get_mock_routes() -> List[Route]:
    return [
        Route(
            id="ROUTE_A",
            name="Route A – Avinashi Road",
            distance=5.2,
            duration=22,
            traffic_status=TrafficStatus.CRITICAL,
            cost=91,
            waypoints=["J1", "J3", "J4"],
            recommended=False,
            blocked=True,
        ),
        Route(
            id="ROUTE_B",
            name="Route B – DB Road",
            distance=6.1,
            duration=16,
            traffic_status=TrafficStatus.HIGH,
            cost=63,
            waypoints=["J1", "J2", "J4"],
            recommended=False,
            blocked=False,
        ),
        Route(
            id="ROUTE_C",
            name="Route C – Mettupalayam Bypass",
            distance=6.8,
            duration=12,
            traffic_status=TrafficStatus.LOW,
            cost=28,
            waypoints=["J1", "J2", "J5", "H1"],
            recommended=True,
            blocked=False,
        ),
    ]