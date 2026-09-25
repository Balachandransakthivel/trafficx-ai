# TRAFFICX AI — Incidents API
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime

from app.models.traffic import Incident, IncidentType, IncidentSeverity, TrafficStatus, COLLECTIONS
from app.database.mongodb import get_database
from app.websocket.manager import broadcast_incident_update

router = APIRouter()


@router.get("/", response_model=List[Incident])
async def get_incidents(status: Optional[str] = None, type: Optional[str] = None):
    db = get_database()
    if db is None:
        incidents = get_mock_incidents()
        if status:
            incidents = [i for i in incidents if i.status == status]
        if type:
            incidents = [i for i in incidents if i.type == type]
        return incidents
    
    query = {}
    if status:
        query["status"] = status
    if type:
        query["type"] = type
    
    incidents = await db[COLLECTIONS["incidents"]].find(query).to_list(100)
    return [Incident(**i) for i in incidents]


@router.get("/{incident_id}", response_model=Incident)
async def get_incident(incident_id: str):
    db = get_database()
    if db is None:
        incidents = get_mock_incidents()
        for i in incidents:
            if i.id == incident_id:
                return i
        raise HTTPException(status_code=404, detail="Incident not found")
    incident = await db[COLLECTIONS["incidents"]].find_one({"id": incident_id})
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return Incident(**incident)


@router.post("/", response_model=Incident)
async def create_incident(incident: Incident):
    db = get_database()
    if db is None:
        return incident
    await db[COLLECTIONS["incidents"]].insert_one(incident.dict())
    await broadcast_incident_update({"type": "incident_created", "data": incident.dict()})
    return incident


@router.put("/{incident_id}", response_model=Incident)
async def update_incident(incident_id: str, incident: Incident):
    db = get_database()
    if db is None:
        return incident
    incident.timestamp = datetime.utcnow()
    await db[COLLECTIONS["incidents"]].replace_one({"id": incident_id}, incident.dict())
    await broadcast_incident_update({"type": "incident_updated", "data": incident.dict()})
    return incident


@router.post("/{incident_id}/resolve")
async def resolve_incident(incident_id: str):
    db = get_database()
    if db is None:
        return {"message": "Incident resolved (mock)"}
    
    incident = await db[COLLECTIONS["incidents"]].find_one({"id": incident_id})
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    incident["status"] = "RESOLVED"
    incident["resolved_at"] = datetime.utcnow()
    await db[COLLECTIONS["incidents"]].replace_one({"id": incident_id}, incident)
    
    await broadcast_incident_update({
        "type": "incident_resolved",
        "data": incident
    })
    return {"message": "Incident resolved", "incident": incident}


@router.post("/simulate/accident")
async def simulate_accident():
    """Simulate an accident at Junction 4"""
    new_incident = Incident(
        id=f"I{int(datetime.utcnow().timestamp())}",
        type=IncidentType.ACCIDENT,
        location="NH Road – Junction 4",
        lat=10.9990,
        lng=77.0251,
        severity=IncidentSeverity.HIGH,
        traffic_impact=TrafficStatus.CRITICAL,
        status="ACTIVE",
        description="AI DETECTED: Multi-vehicle collision. 2 lanes blocked. Emergency response required.",
    )
    
    db = get_database()
    if db:
        await db[COLLECTIONS["incidents"]].insert_one(new_incident.dict())
    
    await broadcast_incident_update({
        "type": "accident_triggered",
        "data": new_incident.dict()
    })
    
    return {"message": "Accident simulated", "incident": new_incident}


def get_mock_incidents() -> List[Incident]:
    return [
        Incident(
            id="I1",
            type=IncidentType.ACCIDENT,
            location="NH Road – Junction 4",
            lat=10.9990,
            lng=77.0251,
            severity=IncidentSeverity.HIGH,
            traffic_impact=TrafficStatus.CRITICAL,
            status="ACTIVE",
            description="Multi-vehicle collision, 2 lanes blocked. Emergency services required.",
        ),
        Incident(
            id="I2",
            type=IncidentType.CONGESTION,
            location="Avinashi Road – Signal 7",
            lat=11.0136,
            lng=77.0247,
            severity=IncidentSeverity.MEDIUM,
            traffic_impact=TrafficStatus.HIGH,
            status="MONITORING",
            description="Heavy vehicle buildup at intersection. Signal timing adjusted.",
        ),
        Incident(
            id="I3",
            type=IncidentType.ROAD_BLOCK,
            location="DB Road – Bypass",
            lat=11.0005,
            lng=76.9691,
            severity=IncidentSeverity.LOW,
            traffic_impact=TrafficStatus.MEDIUM,
            status="RESOLVED",
            description="Temporary road work cleared. Traffic flowing normally.",
        ),
    ]