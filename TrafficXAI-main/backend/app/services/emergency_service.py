# TRAFFICX AI — Emergency Service
from typing import Dict, Any, List
from datetime import datetime

from app.database.mongodb import get_database, COLLECTIONS
from app.api.signals import get_mock_signals
from app.api.traffic import get_mock_roads
from app.services.signal_service import activate_green_corridor_signals, deactivate_green_corridor


async def dispatch_emergency_vehicle(
    vehicle_id: str,
    destination: str,
    dest_lat: float,
    dest_lng: float
) -> Dict[str, Any]:
    """Dispatch an emergency vehicle to a destination"""
    db = get_database()
    
    # Find vehicle
    if db:
        vehicle = await db[COLLECTIONS["vehicles"]].find_one(
            {"$or": [{"id": vehicle_id}, {"vehicle_id": vehicle_id}]}
        )
    else:
        from app.api.emergency import get_mock_vehicles
        vehicles = get_mock_vehicles()
        vehicle = next((v for v in vehicles if v.id == vehicle_id or v.vehicle_id == vehicle_id), None)
    
    if not vehicle:
        raise ValueError(f"Vehicle {vehicle_id} not found")
    
    # Calculate route
    from app.services.route_service import calculate_optimal_route
    route = await calculate_optimal_route(
        vehicle["lat"], vehicle["lng"], dest_lat, dest_lng
    )
    
    # Update vehicle
    vehicle["status"] = "EMERGENCY"
    vehicle["destination"] = destination
    vehicle["dest_lat"] = dest_lat
    vehicle["dest_lng"] = dest_lng
    vehicle["speed"] = 60
    vehicle["eta"] = route["duration"]
    vehicle["route_id"] = route["id"]
    vehicle["timestamp"] = datetime.utcnow()
    
    if db:
        await db[COLLECTIONS["vehicles"]].replace_one(
            {"id": vehicle["id"]}, vehicle
        )
    
    return {
        "vehicle": vehicle,
        "route": route
    }


async def activate_green_corridor_for_vehicle(vehicle_id: str) -> Dict[str, Any]:
    """Activate green corridor for a specific vehicle's route"""
    db = get_database()
    
    # Get vehicle and its route
    if db:
        vehicle = await db[COLLECTIONS["vehicles"]].find_one(
            {"$or": [{"id": vehicle_id}, {"vehicle_id": vehicle_id}]}
        )
    else:
        from app.api.emergency import get_mock_vehicles
        vehicles = get_mock_vehicles()
        vehicle = next((v for v in vehicles if v.id == vehicle_id or v.vehicle_id == vehicle_id), None)
    
    if not vehicle or not vehicle.get("route_id"):
        raise ValueError("Vehicle or route not found")
    
    # Get route waypoints
    if db:
        route = await db[COLLECTIONS["routes"]].find_one({"id": vehicle["route_id"]})
    else:
        from app.api.routes import get_mock_routes
        routes = get_mock_routes()
        route = next((r for r in routes if r.id == vehicle["route_id"]), None)
    
    if not route:
        raise ValueError("Route not found")
    
    # Activate green corridor signals
    result = await activate_green_corridor_signals(route["waypoints"])
    
    # Update vehicle
    vehicle["status"] = "EN_ROUTE"
    vehicle["timestamp"] = datetime.utcnow()
    
    if db:
        await db[COLLECTIONS["vehicles"]].replace_one(
            {"id": vehicle["id"]}, vehicle
        )
    
    return {
        "message": "Green corridor activated",
        "vehicle": vehicle,
        "corridor": result
    }


async def update_vehicle_location(
    vehicle_id: str,
    lat: float,
    lng: float,
    speed: float
) -> Dict[str, Any]:
    """Update vehicle location and recalculate ETA if needed"""
    db = get_database()
    
    if db:
        vehicle = await db[COLLECTIONS["vehicles"]].find_one(
            {"$or": [{"id": vehicle_id}, {"vehicle_id": vehicle_id}]}
        )
    else:
        from app.api.emergency import get_mock_vehicles
        vehicles = get_mock_vehicles()
        vehicle = next((v for v in vehicles if v.id == vehicle_id or v.vehicle_id == vehicle_id), None)
    
    if not vehicle:
        raise ValueError(f"Vehicle {vehicle_id} not found")
    
    vehicle["lat"] = lat
    vehicle["lng"] = lng
    vehicle["speed"] = speed
    vehicle["timestamp"] = datetime.utcnow()
    
    # Recalculate ETA based on remaining distance
    if vehicle.get("dest_lat") and vehicle.get("dest_lng"):
        from app.services.route_service import haversine_distance
        remaining_distance = haversine_distance(lat, lng, vehicle["dest_lat"], vehicle["dest_lng"])
        if speed > 0:
            vehicle["eta"] = max(1, round((remaining_distance / speed) * 60))
    
    if db:
        await db[COLLECTIONS["vehicles"]].replace_one(
            {"id": vehicle["id"]}, vehicle
        )
    
    return vehicle


async def check_emergency_arrival(vehicle_id: str) -> bool:
    """Check if emergency vehicle has arrived at destination"""
    db = get_database()
    
    if db:
        vehicle = await db[COLLECTIONS["vehicles"]].find_one(
            {"$or": [{"id": vehicle_id}, {"vehicle_id": vehicle_id}]}
        )
    else:
        from app.api.emergency import get_mock_vehicles
        vehicles = get_mock_vehicles()
        vehicle = next((v for v in vehicles if v.id == vehicle_id or v.vehicle_id == vehicle_id), None)
    
    if not vehicle:
        return False
    
    if vehicle.get("dest_lat") and vehicle.get("dest_lng"):
        from app.services.route_service import haversine_distance
        distance = haversine_distance(
            vehicle["lat"], vehicle["lng"],
            vehicle["dest_lat"], vehicle["dest_lng"]
        )
        # Arrived if within 200 meters
        if distance < 0.2:
            vehicle["status"] = "ARRIVED"
            vehicle["speed"] = 0
            vehicle["eta"] = 0
            if db:
                await db[COLLECTIONS["vehicles"]].replace_one(
                    {"id": vehicle["id"]}, vehicle
                )
            return True
    
    return False