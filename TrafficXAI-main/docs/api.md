# TRAFFICX AI — API Documentation

## Base URL
```
Development: http://localhost:8000
Production:  https://api.trafficx.ai
```

## Authentication
Currently open for development. JWT authentication planned.

## Common Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Optional message"
}
```

Error Response:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found",
    "details": {}
  }
}
```

---

## Traffic API

### Get All Roads
```http
GET /api/traffic/roads
```

**Response:**
```json
[
  {
    "id": "R1",
    "name": "Avinashi Road",
    "vehicle_count": 38,
    "density": 82,
    "status": "CRITICAL",
    "lat": 11.0136,
    "lng": 77.0247,
    "from_lat": 11.0168,
    "from_lng": 77.0061,
    "to_lat": 11.0104,
    "to_lng": 77.0432,
    "timestamp": "2026-09-25T10:30:00Z"
  }
]
```

### Get Road by ID
```http
GET /api/traffic/roads/{road_id}
```

### Create Road
```http
POST /api/traffic/roads
Content-Type: application/json

{
  "id": "R6",
  "name": "New Road",
  "vehicle_count": 15,
  "density": 30,
  "status": "MEDIUM",
  "lat": 11.0200,
  "lng": 77.0300,
  "from_lat": 11.0250,
  "from_lng": 77.0200,
  "to_lat": 11.0150,
  "to_lng": 77.0400
}
```

### Update Road
```http
PUT /api/traffic/roads/{road_id}
Content-Type: application/json

{
  "vehicle_count": 45,
  "density": 90,
  "status": "CRITICAL"
}
```

### Simulate Traffic Surge
```http
POST /api/traffic/simulate/traffic-surge
```

---

## Emergency API

### Get All Vehicles
```http
GET /api/emergency/vehicles
```

**Response:**
```json
[
  {
    "id": "EV1",
    "vehicle_id": "AMB-001",
    "type": "AMBULANCE",
    "driver_name": "Dr. Ramesh Kumar",
    "status": "EN_ROUTE",
    "current_location": "Junction 4 – Ganapathy",
    "destination": "Government Hospital",
    "lat": 10.9951,
    "lng": 77.0069,
    "dest_lat": 11.0100,
    "dest_lng": 77.0155,
    "speed": 42,
    "eta": 8,
    "route_id": "ROUTE_C",
    "timestamp": "2026-09-25T10:30:00Z"
  }
]
```

### Get Vehicle
```http
GET /api/emergency/vehicles/{vehicle_id}
```

### Dispatch Ambulance
```http
POST /api/emergency/dispatch
Content-Type: application/json

{
  "vehicle_id": "AMB-002",
  "destination": "Government Hospital",
  "dest_lat": 11.0100,
  "dest_lng": 77.0155,
  "priority": "HIGH"
}
```

**Response:**
```json
{
  "message": "Ambulance dispatched",
  "vehicle": { ... },
  "route": {
    "id": "ROUTE_C",
    "name": "Route C – Mettupalayam Bypass",
    "distance": 6.8,
    "duration": 12,
    "traffic_status": "LOW",
    "cost": 28,
    "waypoints": ["J1", "J2", "J5", "H1"],
    "recommended": true,
    "blocked": false
  }
}
```

### Activate Green Corridor
```http
POST /api/emergency/green-corridor/{vehicle_id}
```

### Update Vehicle Location
```http
POST /api/emergency/vehicles/{vehicle_id}/location
Content-Type: application/json

{
  "lat": 10.9980,
  "lng": 77.0100,
  "speed": 45
}
```

---

## Incidents API

### List Incidents
```http
GET /api/incidents/?status=ACTIVE&type=ACCIDENT
```

**Query Parameters:**
- `status`: ACTIVE | MONITORING | RESOLVED
- `type`: ACCIDENT | CONGESTION | ROAD_BLOCK | SIGNAL_FAILURE | FLOODING | VEHICLE_BREAKDOWN

### Get Incident
```http
GET /api/incidents/{incident_id}
```

### Create Incident
```http
POST /api/incidents/
Content-Type: application/json

{
  "id": "I4",
  "type": "ACCIDENT",
  "location": "Trichy Road – Peelamedu",
  "lat": 10.9852,
  "lng": 77.0200,
  "severity": "HIGH",
  "traffic_impact": "CRITICAL",
  "status": "ACTIVE",
  "description": "Two-wheeler collision, lane blocked"
}
```

### Update Incident
```http
PUT /api/incidents/{incident_id}
Content-Type: application/json

{
  "status": "MONITORING",
  "severity": "MEDIUM"
}
```

### Resolve Incident
```http
POST /api/incidents/{incident_id}/resolve
```

### Simulate Accident (Demo)
```http
POST /api/incidents/simulate/accident
```

---

## Routes API

### List Routes
```http
GET /api/routes/
```

### Get Route
```http
GET /api/routes/{route_id}
```

### Calculate Optimal Route
```http
POST /api/routes/calculate
Content-Type: application/json

{
  "start_lat": 10.9990,
  "start_lng": 77.0251,
  "end_lat": 11.0100,
  "end_lng": 77.0155,
  "avoid_incidents": true,
  "priority": "EMERGENCY"
}
```

**Response:**
```json
{
  "id": "ROUTE_C",
  "name": "Route C – Mettupalayam Bypass",
  "distance": 6.8,
  "duration": 12,
  "traffic_status": "LOW",
  "cost": 28,
  "waypoints": ["J1", "J2", "J5", "H1"],
  "recommended": true,
  "blocked": false
}
```

### Select Route as Recommended
```http
POST /api/routes/{route_id}/select
```

### Compare All Routes
```http
GET /api/routes/compare/all?start_lat=10.9990&start_lng=77.0251&end_lat=11.0100&end_lng=77.0155
```

---

## Signals API

### List Signals
```http
GET /api/signals/
```

### Get Signal
```http
GET /api/signals/{signal_id}
```

### Update Signal
```http
PUT /api/signals/{signal_id}
Content-Type: application/json

{
  "state": "GREEN",
  "green_corridor": true
}
```

### Activate Green Corridor
```http
POST /api/signals/green-corridor/activate
Content-Type: application/json

{
  "route_waypoints": ["J1", "J2", "J3"]
}
```

### Deactivate Green Corridor
```http
POST /api/signals/green-corridor/deactivate
```

### Set Signal State
```http
POST /api/signals/{signal_id}/state
Content-Type: application/json

{
  "state": "RED"
}
```

---

## Predictions API

### List Predictions
```http
GET /api/predictions/
```

### Get Road Prediction
```http
GET /api/predictions/{road_name}
```

### Generate Prediction
```http
POST /api/predictions/predict
Content-Type: application/json

{
  "road_name": "Avinashi Road",
  "current_status": "HIGH",
  "historical_data": []
}
```

**Response:**
```json
{
  "road_name": "Avinashi Road",
  "current_status": "HIGH",
  "prediction_30min": "CRITICAL",
  "prediction_60min": "CRITICAL",
  "confidence": 87,
  "peak_hour": "5:30 PM"
}
```

### Batch Predict
```http
POST /api/predictions/batch-predict
Content-Type: application/json

{
  "roads": [
    {"road_name": "Avinashi Road", "current_status": "HIGH"},
    {"road_name": "Trichy Road", "current_status": "MEDIUM"}
  ]
}
```

---

## WebSocket API

### Connection
```javascript
const socket = io('ws://localhost:8000/ws', {
  transports: ['websocket'],
  reconnection: true
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
  
  // Subscribe to channels
  socket.emit('subscribe', { 
    channels: ['traffic', 'emergency', 'incidents', 'signals', 'routes', 'predictions'] 
  });
});
```

### Server → Client Events

#### Traffic Update
```javascript
socket.on('traffic_update', (data) => {
  // data: { type: "road_updated", data: { ...road object... } }
});
```

#### Incident Update
```javascript
socket.on('incident_update', (data) => {
  // data: { type: "incident_created" | "incident_updated" | "incident_resolved", data: {...} }
});
```

#### Emergency Update
```javascript
socket.on('emergency_update', (data) => {
  // data: { type: "vehicle_created" | "vehicle_updated" | "ambulance_dispatched" | "green_corridor_activated" | "location_update", data: {...} }
});
```

#### Signal Update
```javascript
socket.on('signal_update', (data) => {
  // data: { type: "signal_updated" | "signal_state_changed" | "green_corridor_activated" | "green_corridor_deactivated", data: {...} }
});
```

#### Route Update
```javascript
socket.on('route_update', (data) => {
  // data: { type: "route_selected" | "route_updated", data: {...} }
});
```

#### Prediction Update
```javascript
socket.on('prediction_update', (data) => {
  // data: { type: "prediction_updated" | "batch_prediction_updated", data: {...} }
});
```

#### Alert
```javascript
socket.on('alert', (data) => {
  // data: { type: "INCIDENT" | "EMERGENCY" | "PREDICTION" | "CORRIDOR" | "INFO", title: "...", message: "...", timestamp: "..." }
});
```

#### Simulation Update
```javascript
socket.on('simulation_update', (data) => {
  // data: { accidentTriggered, ambulanceDeployed, greenCorridorActive, trafficSurge, scenarioStep }
});
```

### Client → Server Events

#### Subscribe
```javascript
socket.emit('subscribe', { 
  channels: ['traffic', 'emergency', 'incidents', 'signals', 'routes', 'predictions'] 
});
```

#### Unsubscribe
```javascript
socket.emit('unsubscribe', { 
  channels: ['traffic'] 
});
```

#### Ping
```javascript
socket.emit('ping');
socket.on('pong', (data) => {
  console.log('Latency:', Date.now() - data.timestamp);
});
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Invalid request payload |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Dependency unavailable |

---

## Rate Limits (Planned)

| Endpoint | Limit |
|----------|-------|
| Traffic reads | 100/min |
| Traffic writes | 20/min |
| Emergency dispatch | 10/min |
| Incidents CRUD | 50/min |
| Route calculation | 30/min |
| Predictions | 20/min |

---

## SDK Examples

### JavaScript/TypeScript
```typescript
// API Client
class TrafficXClient {
  constructor(baseUrl = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
    this.ws = null;
  }

  async getRoads() {
    const res = await fetch(`${this.baseUrl}/api/traffic/roads`);
    return res.json();
  }

  async dispatchAmbulance(vehicleId, destination, destLat, destLng) {
    const res = await fetch(`${this.baseUrl}/api/emergency/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicle_id: vehicleId, destination, dest_lat: destLat, dest_lng: destLng })
    });
    return res.json();
  }

  connectWebSocket() {
    this.ws = io(`${this.baseUrl}/ws`);
    this.ws.on('emergency_update', (data) => {
      this.onEmergencyUpdate(data);
    });
  }

  onEmergencyUpdate(data) {
    // Override in subclass
  }
}
```

### Python
```python
import httpx
import socketio

class TrafficXClient:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.client = httpx.AsyncClient(base_url=base_url)
        self.sio = socketio.AsyncClient()

    async def get_roads(self):
        resp = await self.client.get("/api/traffic/roads")
        return resp.json()

    async def dispatch_ambulance(self, vehicle_id: str, destination: str, dest_lat: float, dest_lng: float):
        resp = await self.client.post("/api/emergency/dispatch", json={
            "vehicle_id": vehicle_id,
            "destination": destination,
            "dest_lat": dest_lat,
            "dest_lng": dest_lng
        })
        return resp.json()

    async def connect_ws(self):
        await self.sio.connect(f"{self.base_url}/ws")
        
        @self.sio.on("emergency_update")
        async def on_emergency(data):
            self.on_emergency_update(data)

    def on_emergency_update(self, data):
        pass  # Override
```

---

## Changelog

### v1.0.0 (2026-09-25)
- Initial API release
- Traffic, Emergency, Incidents, Routes, Signals, Predictions endpoints
- WebSocket real-time updates
- Demo simulation endpoints