# TRAFFICX AI — Emergency API
from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime

from app.models.traffic import EmergencyVehicle, EmergencyStatus, COLLECTIONS
from app.database.mongodb import get_database
from app.websocket.manager import broadcast_emergency_update
from app.services.route_service import calculate_optimal_route
from app.services.emergency_service import activate_green_corridor_for_vehicle

router = APIRouter()


@router.get("/vehicles", response_model=List[EmergencyVehicle])
async def get_vehicles():
    db = get_database()
    if db is None:
        return get_mock_vehicles()
    vehicles = await db[COLLECTIONS["vehicles"]].find().to_list(100)
    return [EmergencyVehicle(**v) for v in vehicles]


@router.get("/vehicles/{vehicle_id}", response_model=EmergencyVehicle)
async def get_vehicle(vehicle_id: str):
    db = get_database()
    if db is None:
        vehicles = get_mock_vehicles()
        for v in vehicles:
            if v.id == vehicle_id or v.vehicle_id == vehicle_id:
                return v
        raise HTTPException(status_code=404, detail="Vehicle not found")
    vehicle = await db[COLLECTIONS["vehicles"]].find_one(
        {"$or": [{"id": vehicle_id}, {"vehicle_id": vehicle_id}]}
    )
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return EmergencyVehicle(**vehicle)


@router.post("/vehicles", response_model=EmergencyVehicle)
async def create_vehicle(vehicle: EmergencyVehicle):
    db = get_database()
    if db is None:
        return vehicle
    await db[COLLECTIONS["vehicles"]].insert_one(vehicle.dict())
    await broadcast_emergency_update({"type": "vehicle_created", "data": vehicle.dict()})
    return vehicle


@router.put("/vehicles/{vehicle_id}", response_model=EmergencyVehicle)
async def update_vehicle(vehicle_id: str, vehicle: EmergencyVehicle):
    db = get_database()
    if db is None:
        return vehicle
    vehicle.timestamp = datetime.utcnow()
    await db[COLLECTIONS["vehicles"]].replace_one(
        {"$or": [{"id": vehicle_id}, {"vehicle_id": vehicle_id}]}, 
        vehicle.dict()
    )
    await broadcast_emergency_update({"type": "vehicle_updated", "data": vehicle.dict()})
    return vehicle


@router.post("/dispatch")
async def dispatch_ambulance(
    vehicle_id: str,
    destination: str,
    dest_lat: float,
    dest_lng: float,
    priority: str = "HIGH"
):
    """Dispatch an ambulance to a destination"""
    db = get_database()
    
    # Find the vehicle
    if db:
        vehicle = await db[COLLECTIONS["vehicles"]].find_one(
            {"$or": [{"id": vehicle_id}, {"vehicle_id": vehicle_id}]}
        )
    else:
        vehicles = get_mock_vehicles()
        vehicle = next((v for v in vehicles if v.id == vehicle_id or v.vehicle_id == vehicle_id), None)
    
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # Calculate optimal route
    route = await calculate_optimal_route(
        vehicle["lat"], vehicle["lng"],
        dest_lat, dest_lng
    )
    
    # Update vehicle
    vehicle["status"] = EmergencyStatus.EMERGENCY
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
    
    await broadcast_emergency_update({
        "type": "ambulance_dispatched",
        "data": vehicle
    })
    
    return {
        "message": "Ambulance dispatched",
        "vehicle": vehicle,
        "route": route
    }


@router.post("/green-corridor/{vehicle_id}")
async def activate_green_corridor(vehicle_id: str):
    """Activate green corridor for an emergency vehicle"""
    result = await activate_green_corridor_for_vehicle(vehicle_id)
    await broadcast_emergency_update({
        "type": "green_corridor_activated",
        "data": result
    })
    return result


@router.post("/vehicles/{vehicle_id}/location")
async def update_vehicle_location(
    vehicle_id: str,
    lat: float,
    lng: float,
    speed: float
):
    """Update vehicle GPS location"""
    db = get_database()
    
    if db:
        vehicle = await db[COLLECTIONS["vehicles"]].find_one(
            {"$or": [{"id": vehicle_id}, {"vehicle_id": vehicle_id}]}
        )
        if vehicle:
            vehicle["lat"] = lat
            vehicle["lng"] = lng
            vehicle["speed"] = speed
            vehicle["timestamp"] = datetime.utcnow()
            await db[COLLECTIONS["vehicles"]].replace_one(
                {"id": vehicle["id"]}, vehicle
            )
            await broadcast_emergency_update({
                "type": "location_update",
                "data": {"vehicle_id": vehicle_id, "lat": lat, "lng": lng, "speed": speed}
            })
            return {"message": "Location updated", "vehicle": vehicle}
    
    raise HTTPException(status_code=404, detail="Vehicle not found")


def get_mock_vehicles() -> List[EmergencyVehicle]:
    return [
        EmergencyVehicle(
            id="EV1",
            vehicle_id="AMB-001",
            type="AMBULANCE",
            driver_name="Dr. Ramesh Kumar",
            status=EmergencyStatus.EN_ROUTE,
            current_location="Junction 4 – Ganapathy",
            destination="Government Hospital",
            lat=10.9951,
            lng=77.0069,
            dest_lat=11.0100,
            dest_lng=77.0155,
            speed=42,
            eta=8,
            route_id="ROUTE_C",
        ),
        EmergencyVehicle(
            id="EV2",
            vehicle_id="AMB-002",
            type="AMBULANCE",
            driver_name="Nurse Priya S.",
            status=EmergencyStatus.STANDBY,
            current_location="KMCH Hospital",
            destination="",
            lat=11.0138,
            lng=77.0330,
            dest_lat=11.0138,
            dest_lng=77.0330,
            speed=0,
            eta=0,
        ),
        EmergencyVehicle(
            id="EV3",
            vehicle_id="FIRE-01",
            type="FIRE",
            driver_name="Suresh Babu",
            status=EmergencyStatus.EMERGENCY,
            current_location="Anna Nagar",
            destination="NH Road – Junction 4",
            lat=11.0168,
            lng=77.0061,
            dest_lat=10.9990,
            dest_lng=77.0251,
            speed=67,
            eta=5,
        ),
    ]