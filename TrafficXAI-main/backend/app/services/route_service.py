# TRAFFICX AI — Route Service
from typing import List, Dict, Any
import random
import math
from datetime import datetime

from app.models.traffic import Route, TrafficStatus
from app.database.mongodb import get_database, COLLECTIONS
from app.api.incidents import get_mock_incidents
from app.api.traffic import get_mock_roads


async def calculate_optimal_route(
    start_lat: float,
    start_lng: float,
    end_lat: float,
    end_lng: float,
    avoid_incidents: bool = True,
    priority: str = "EMERGENCY"
) -> Dict[str, Any]:
    """
    Calculate optimal route using AI-weighted cost algorithm
    Cost = Distance×0.4 + Traffic×0.4 + Incident Risk×0.2
    """
    # Get current traffic and incidents
    db = get_database()
    if db:
        roads = await db[COLLECTIONS["roads"]].find().to_list(100)
        incidents = await db[COLLECTIONS["incidents"]].find({"status": "ACTIVE"}).to_list(100)
    else:
        roads = get_mock_roads()
        incidents = [i for i in get_mock_incidents() if i.status == "ACTIVE"]
    
    # Calculate distance (Haversine formula)
    distance = haversine_distance(start_lat, start_lng, end_lat, end_lng)
    
    # Generate multiple route options
    routes = generate_route_options(start_lat, start_lng, end_lat, end_lng, roads, incidents)
    
    # Calculate cost for each route
    for route in routes:
        route["cost"] = calculate_route_cost(route, priority)
        route["recommended"] = False
    
    # Sort by cost (lower is better)
    routes.sort(key=lambda r: r["cost"])
    
    # Mark best route
    if routes:
        routes[0]["recommended"] = True
    
    return routes[0] if routes else generate_fallback_route(start_lat, start_lng, end_lat, end_lng)


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points in km"""
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat/2)**2 + 
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c


def generate_route_options(
    start_lat: float, start_lng: float,
    end_lat: float, end_lng: float,
    roads: List[Dict], incidents: List[Dict]
) -> List[Dict]:
    """Generate multiple route options based on road network"""
    
    # Simplified: return 3 predefined routes with variations
    base_routes = [
        {
            "id": "ROUTE_A",
            "name": "Route A – Avinashi Road",
            "distance": 5.2 + random.uniform(-0.3, 0.3),
            "duration": 22 + random.randint(-3, 5),
            "traffic_status": TrafficStatus.CRITICAL,
            "waypoints": ["J1", "J3", "J4"],
            "blocked": True,
        },
        {
            "id": "ROUTE_B",
            "name": "Route B – DB Road",
            "distance": 6.1 + random.uniform(-0.3, 0.3),
            "duration": 16 + random.randint(-2, 4),
            "traffic_status": TrafficStatus.HIGH,
            "waypoints": ["J1", "J2", "J4"],
            "blocked": False,
        },
        {
            "id": "ROUTE_C",
            "name": "Route C – Mettupalayam Bypass",
            "distance": 6.8 + random.uniform(-0.3, 0.3),
            "duration": 12 + random.randint(-1, 3),
            "traffic_status": TrafficStatus.LOW,
            "waypoints": ["J1", "J2", "J5", "H1"],
            "blocked": False,
        },
    ]
    
    # Adjust based on incidents
    for route in base_routes:
        for incident in incidents:
            # Check if incident affects this route
            for wp in route["waypoints"]:
                if incident["location"].split("–")[0].strip() in wp or wp in incident["location"]:
                    if incident["severity"] in ["HIGH", "CRITICAL"]:
                        route["traffic_status"] = TrafficStatus.CRITICAL
                        route["blocked"] = True
                        route["duration"] += 10
    
    return base_routes


def calculate_route_cost(route: Dict, priority: str) -> int:
    """
    Calculate route cost using weighted algorithm
    Cost = Distance×0.4 + Traffic×0.4 + Incident Risk×0.2
    """
    # Distance score (0-100, higher = worse)
    distance_score = min(100, route["distance"] * 10)
    
    # Traffic score
    traffic_scores = {
        TrafficStatus.LOW: 10,
        TrafficStatus.MEDIUM: 30,
        TrafficStatus.HIGH: 60,
        TrafficStatus.CRITICAL: 90,
    }
    traffic_score = traffic_scores.get(route["traffic_status"], 50)
    
    # Incident risk score
    incident_score = 50 if route.get("blocked", False) else 0
    
    # Emergency priority adjustments
    if priority == "EMERGENCY":
        # Emergency vehicles prioritize speed over distance
        distance_weight = 0.3
        traffic_weight = 0.5
        incident_weight = 0.2
    else:
        distance_weight = 0.4
        traffic_weight = 0.4
        incident_weight = 0.2
    
    cost = (
        distance_score * distance_weight +
        traffic_score * traffic_weight +
        incident_score * incident_weight
    )
    
    return round(cost)


async def get_all_routes(
    start_lat: float, start_lng: float,
    end_lat: float, end_lng: float
) -> List[Dict]:
    """Get all route options with detailed comparison"""
    db = get_database()
    if db:
        roads = await db[COLLECTIONS["roads"]].find().to_list(100)
        incidents = await db[COLLECTIONS["incidents"]].find({"status": "ACTIVE"}).to_list(100)
    else:
        roads = get_mock_roads()
        incidents = [i for i in get_mock_incidents() if i.status == "ACTIVE"]
    
    routes = generate_route_options(start_lat, start_lng, end_lat, end_lng, roads, incidents)
    
    for route in routes:
        route["cost"] = calculate_route_cost(route, "EMERGENCY")
        route["recommended"] = False
    
    routes.sort(key=lambda r: r["cost"])
    if routes:
        routes[0]["recommended"] = True
    
    return routes


def generate_fallback_route(
    start_lat: float, start_lng: float,
    end_lat: float, end_lng: float
) -> Dict[str, Any]:
    """Generate a fallback route when no roads available"""
    distance = haversine_distance(start_lat, start_lng, end_lat, end_lng)
    return {
        "id": f"ROUTE_FALLBACK_{int(datetime.utcnow().timestamp())}",
        "name": "Direct Route (Fallback)",
        "distance": round(distance, 1),
        "duration": round(distance * 2),  # Assume 30 km/h average
        "traffic_status": TrafficStatus.MEDIUM,
        "cost": 50,
        "waypoints": ["START", "END"],
        "recommended": True,
        "blocked": False,
    }