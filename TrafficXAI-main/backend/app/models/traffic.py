# TRAFFICX AI — Database Models
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class TrafficStatus(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class IncidentSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class EmergencyStatus(str, Enum):
    STANDBY = "STANDBY"
    EMERGENCY = "EMERGENCY"
    EN_ROUTE = "EN_ROUTE"
    ARRIVED = "ARRIVED"


class SignalState(str, Enum):
    GREEN = "GREEN"
    YELLOW = "YELLOW"
    RED = "RED"


class IncidentType(str, Enum):
    ACCIDENT = "ACCIDENT"
    CONGESTION = "CONGESTION"
    ROAD_BLOCK = "ROAD_BLOCK"
    SIGNAL_FAILURE = "SIGNAL_FAILURE"
    FLOODING = "FLOODING"
    VEHICLE_BREAKDOWN = "VEHICLE_BREAKDOWN"


class TrafficRoad(BaseModel):
    id: str
    name: str
    vehicle_count: int
    density: float
    status: TrafficStatus
    lat: float
    lng: float
    from_lat: float
    from_lng: float
    to_lat: float
    to_lng: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "id": "R1",
                "name": "Avinashi Road",
                "vehicle_count": 38,
                "density": 82.0,
                "status": "CRITICAL",
                "lat": 11.0136,
                "lng": 77.0247,
                "from_lat": 11.0168,
                "from_lng": 77.0061,
                "to_lat": 11.0104,
                "to_lng": 77.0432,
            }
        }


class Incident(BaseModel):
    id: str
    type: IncidentType
    location: str
    lat: float
    lng: float
    severity: IncidentSeverity
    traffic_impact: TrafficStatus
    status: str  # ACTIVE, RESOLVED, MONITORING
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    description: str
    resolved_at: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "id": "I1",
                "type": "ACCIDENT",
                "location": "NH Road – Junction 4",
                "lat": 10.9990,
                "lng": 77.0251,
                "severity": "HIGH",
                "traffic_impact": "CRITICAL",
                "status": "ACTIVE",
                "description": "Multi-vehicle collision, 2 lanes blocked",
            }
        }


class EmergencyVehicle(BaseModel):
    id: str
    vehicle_id: str
    type: str  # AMBULANCE, FIRE, POLICE
    driver_name: str
    status: EmergencyStatus
    current_location: str
    destination: str
    lat: float
    lng: float
    dest_lat: float
    dest_lng: float
    speed: float
    eta: int  # minutes
    route_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class TrafficSignal(BaseModel):
    id: str
    junction_id: str
    junction_name: str
    state: SignalState
    green_corridor: bool
    vehicle_count: int
    lat: float
    lng: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class Route(BaseModel):
    id: str
    name: str
    distance: float
    duration: int
    traffic_status: TrafficStatus
    cost: int
    waypoints: List[str]
    recommended: bool
    blocked: bool


class VehicleDetection(BaseModel):
    total_vehicles: int
    cars: int
    bikes: int
    buses: int
    trucks: int
    ambulances: int
    traffic_status: TrafficStatus
    density: float
    confidence: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class TrafficPrediction(BaseModel):
    road_name: str
    current_status: TrafficStatus
    prediction_30min: TrafficStatus
    prediction_60min: TrafficStatus
    confidence: float
    peak_hour: str


class Alert(BaseModel):
    id: str
    type: str  # INCIDENT, EMERGENCY, PREDICTION, CORRIDOR, INFO
    title: str
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    read: bool = False


class SimulationState(BaseModel):
    accident_triggered: bool = False
    ambulance_deployed: bool = False
    green_corridor_active: bool = False
    traffic_surge: bool = False
    scenario_step: int = 0


# Database collections names
COLLECTIONS = {
    "roads": "traffic_roads",
    "incidents": "incidents",
    "vehicles": "emergency_vehicles",
    "signals": "traffic_signals",
    "routes": "routes",
    "detections": "vehicle_detections",
    "predictions": "traffic_predictions",
    "alerts": "alerts",
    "simulation": "simulation_state",
}