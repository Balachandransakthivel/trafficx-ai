# TRAFFICX AI — Architecture Documentation

## System Overview

TRAFFICX AI is a three-tier architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    MOBILE APP (React Native)                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ Dashboard│ │ Live Map│ │Emergency│ │Incidents│ ...       │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘           │
│       │           │           │           │                 │
│       └───────────┼───────────┼───────────┘                 │
│                   ▼                                       │
│         ┌─────────────────┐                               │
│         │  WebSocket      │                               │
│         │  (Socket.IO)    │                               │
│         └────────┬────────┘                               │
└──────────────────│────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API (FastAPI)                     │
│  ┌────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐          │
│  │ Traffic│ │Emergency │ │Incidents│ │ Routes   │ ...       │
│  └────┬───┘ └────┬─────┘ └────┬────┘ └────┬────┘          │
│       │          │           │           │                 │
│       └──────────┼───────────┼───────────┘                 │
│                  ▼                                       │
│         ┌─────────────────┐                               │
│         │   MongoDB       │                               │
│         │  (Async Motor)  │                               │
│         └─────────────────┘                               │
└─────────────────────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                      AI SERVICES (Python)                    │
│  ┌───────────────┐ ┌─────────────────┐ ┌─────────────────┐  │
│  │ Vehicle Detect│ │Traffic Predict  │ │Incident Detect  │  │
│  │    (YOLOv8)   │ │  (RandomForest) │ │  (Multi-source) │  │
│  └───────────────┘ └─────────────────┘ └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Traffic Monitoring Flow
```
Camera Feed → YOLO Detection → Vehicle Counts → Density Calculation 
                                                      ↓
                              Traffic Status ← Threshold Mapping
                                                      ↓
                                    ┌─────────────────┐
                                    │  MongoDB        │
                                    │  (traffic_roads)│
                                    └────────┬────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    ▼                        ▼                        ▼
            ┌─────────────┐          ┌─────────────┐          ┌─────────────┐
            │ Mobile App  │          │ WebSocket   │          │ Prediction  │
            │ (Live Map)  │          │ Broadcast   │          │ Service     │
            └─────────────┘          └─────────────┘          └─────────────┘
```

### 2. Emergency Response Flow
```
Operator → Dispatch Ambulance → Route Engine → Calculate Routes
                                                      ↓
                              Cost Algorithm (Distance×0.4 + Traffic×0.4 + Risk×0.2)
                                                      ↓
                                    Select Lowest Cost Route
                                                      ↓
                                    Activate Green Corridor
                                                      ↓
                                    Signals J1→J2→J3 = GREEN
                                                      ↓
                                    Ambulance Navigation → Hospital
```

### 3. Incident Detection Flow
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ AI Video     │     │ Traffic Data │     │ Operator     │
│ Analysis     │     │ Anomaly      │     │ Reports      │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       └────────────────────┼────────────────────┘
                            ▼
                   ┌─────────────────┐
                   │ Incident Fusion │
                   │ (Deduplication) │
                   └────────┬────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │  MongoDB        │
                   │  (incidents)    │
                   └────────┬────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
       ┌───────────┐ ┌───────────┐ ┌───────────┐
       │ Alert     │ │ Route     │ │ Signal    │
       │ System    │ │ Engine    │ │ Manager   │
       └───────────┘ └───────────┘ └───────────┘
```

## Component Details

### Mobile App (React Native + Expo)

**State Management**: React Context + Zustand
- `TrafficContext`: Global traffic state (roads, incidents, vehicles, signals, routes, detection, alerts, simulation)
- `useTraffic()`: Hook for accessing context

**Navigation**: Expo Router (file-based)
- Stack navigator for auth flow
- Tab navigator for main app (5 tabs)
- Side drawer for navigation

**Key Components**:
| Component | Purpose |
|-----------|---------|
| `ScreenShell` | Consistent screen wrapper with header |
| `SideDrawer` | Animated navigation drawer |
| `StatCard` | Dashboard metric cards |
| `RoadStatusCard` | Road density visualization |
| `IncidentCard` | Incident display with actions |
| `RouteCard` | Route comparison card |
| `SignalCard` | Signal state display |
| `SimulationPanel` | Demo controls |

**Real-time**: Socket.IO client
- Auto-reconnect
- Channel subscriptions
- Optimistic UI updates

### Backend API (FastAPI)

**Structure**:
```
app/
├── main.py              # FastAPI app + lifespan
├── api/                 # REST routers
│   ├── traffic.py       # Roads, density, simulation
│   ├── emergency.py     # Vehicles, dispatch, green corridor
│   ├── incidents.py     # CRUD, simulation triggers
│   ├── routes.py        # Optimization, comparison
│   ├── signals.py       # States, green corridor
│   └── predictions.py   # Forecasts, batch predict
├── models/              # Pydantic schemas
├── services/            # Business logic
│   ├── route_service.py      # Cost algorithm
│   ├── emergency_service.py  # Dispatch, tracking
│   ├── signal_service.py     # Green corridor logic
│   └── prediction_service.py # ML inference
├── websocket/           # Socket.IO server
│   └── manager.py       # Broadcast functions
└── database/            # MongoDB connection
    └── mongodb.py       # Async motor client
```

**WebSocket Events**:
| Event | Direction | Payload |
|-------|-----------|---------|
| `connect` | Client→Server | Auth (optional) |
| `subscribe` | Client→Server | `{channels: string[]}` |
| `traffic_update` | Server→Client | Road data |
| `incident_update` | Server→Client | Incident data |
| `emergency_update` | Server→Client | Vehicle data |
| `signal_update` | Server→Client | Signal states |
| `route_update` | Server→Client | Route data |
| `prediction_update` | Server→Client | Forecast data |
| `alert` | Server→Client | System alert |
| `simulation_update` | Server→Client | Demo state |

### AI Services

#### 1. Vehicle Detection (`ai/vehicle_detection/detector.py`)
- **Model**: YOLOv8n (nano) - 3.2M params, ~80 FPS on CPU
- **Classes**: Car, Motorcycle, Bus, Truck (+ custom for Ambulance/Fire)
- **Output**: Bounding boxes, class, confidence
- **Analysis**: Count by class, density %, traffic status
- **Video Processing**: Frame-by-frame with optional output

#### 2. Traffic Prediction (`ai/traffic_prediction/predictor.py`)
- **Model**: RandomForestRegressor (100 estimators)
- **Features**: Time (cyclical), lag features, rolling stats, road encoding
- **Horizons**: 30 min, 60 min
- **Training**: Synthetic data generator (60 days, 5-min intervals)
- **Output**: Predicted count, density, status, confidence

#### 3. Incident Detection (`ai/incident_detection/detector.py`)
- **Sources**: Video analysis, traffic anomalies, operator reports
- **Types**: Accident, Congestion, Road Block, Signal Failure, Flooding
- **Fusion**: Distance/time-based deduplication
- **Output**: Typed incidents with severity, confidence, location

## Database Schema

### Collections

```javascript
// traffic_roads
{
  _id: ObjectId,
  id: "R1",
  name: "Avinashi Road",
  vehicle_count: 38,
  density: 82,
  status: "CRITICAL",  // LOW | MEDIUM | HIGH | CRITICAL
  lat: 11.0136,
  lng: 77.0247,
  from_lat: 11.0168,
  from_lng: 77.0061,
  to_lat: 11.0104,
  to_lng: 77.0432,
  timestamp: ISODate
}

// incidents
{
  _id: ObjectId,
  id: "I1",
  type: "ACCIDENT",  // ACCIDENT | CONGESTION | ROAD_BLOCK | SIGNAL_FAILURE | FLOODING | VEHICLE_BREAKDOWN
  location: "NH Road – Junction 4",
  lat: 10.9990,
  lng: 77.0251,
  severity: "HIGH",  // LOW | MEDIUM | HIGH | CRITICAL
  traffic_impact: "CRITICAL",
  status: "ACTIVE",  // ACTIVE | RESOLVED | MONITORING
  timestamp: ISODate,
  description: "Multi-vehicle collision...",
  resolved_at: ISODate (optional)
}

// emergency_vehicles
{
  _id: ObjectId,
  id: "EV1",
  vehicle_id: "AMB-001",
  type: "AMBULANCE",  // AMBULANCE | FIRE | POLICE
  driver_name: "Dr. Ramesh Kumar",
  status: "EN_ROUTE",  // STANDBY | EMERGENCY | EN_ROUTE | ARRIVED
  current_location: "Junction 4 – Ganapathy",
  destination: "Government Hospital",
  lat: 10.9951,
  lng: 77.0069,
  dest_lat: 11.0100,
  dest_lng: 77.0155,
  speed: 42,
  eta: 8,
  route_id: "ROUTE_C",
  timestamp: ISODate
}

// traffic_signals
{
  _id: ObjectId,
  id: "SIG1",
  junction_id: "J1",
  junction_name: "Junction 1 – Anna Nagar",
  state: "GREEN",  // GREEN | YELLOW | RED
  green_corridor: true,
  vehicle_count: 14,
  lat: 11.0168,
  lng: 77.0061,
  timestamp: ISODate
}

// routes
{
  _id: ObjectId,
  id: "ROUTE_A",
  name: "Route A – Avinashi Road",
  distance: 5.2,
  duration: 22,
  traffic_status: "CRITICAL",
  cost: 91,
  waypoints: ["J1", "J3", "J4"],
  recommended: false,
  blocked: true
}

// vehicle_detections
{
  _id: ObjectId,
  total_vehicles: 37,
  cars: 22,
  bikes: 10,
  buses: 3,
  trucks: 2,
  ambulances: 0,
  traffic_status: "HIGH",
  density: 74,
  confidence: 93.4,
  timestamp: ISODate
}

// traffic_predictions
{
  _id: ObjectId,
  road_name: "Avinashi Road",
  current_status: "HIGH",
  prediction_30min: "CRITICAL",
  prediction_60min: "CRITICAL",
  confidence: 87,
  peak_hour: "5:30 PM",
  timestamp: ISODate
}

// alerts
{
  _id: ObjectId,
  id: "A1",
  type: "INCIDENT",  // INCIDENT | EMERGENCY | PREDICTION | CORRIDOR | INFO
  title: "Accident Detected",
  message: "NH Road – Junction 4...",
  timestamp: ISODate,
  read: false
}
```

## API Reference

### Traffic API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/traffic/roads` | List all roads |
| GET | `/api/traffic/roads/{id}` | Get road details |
| POST | `/api/traffic/roads` | Create road |
| PUT | `/api/traffic/roads/{id}` | Update road |
| POST | `/api/traffic/simulate/traffic-surge` | Simulate surge |

### Emergency API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/emergency/vehicles` | List all vehicles |
| GET | `/api/emergency/vehicles/{id}` | Get vehicle |
| POST | `/api/emergency/dispatch` | Dispatch ambulance |
| POST | `/api/emergency/green-corridor/{id}` | Activate corridor |
| POST | `/api/emergency/vehicles/{id}/location` | Update GPS |

### Incidents API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/incidents/` | List incidents (filterable) |
| GET | `/api/incidents/{id}` | Get incident |
| POST | `/api/incidents/` | Create incident |
| PUT | `/api/incidents/{id}` | Update incident |
| POST | `/api/incidents/{id}/resolve` | Resolve incident |
| POST | `/api/incidents/simulate/accident` | Trigger demo accident |

### Routes API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/routes/` | List routes |
| GET | `/api/routes/{id}` | Get route |
| POST | `/api/routes/calculate` | Calculate optimal route |
| POST | `/api/routes/{id}/select` | Mark as recommended |
| GET | `/api/routes/compare/all` | Compare all routes |

### Signals API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/signals/` | List signals |
| GET | `/api/signals/{id}` | Get signal |
| PUT | `/api/signals/{id}` | Update signal |
| POST | `/api/signals/green-corridor/activate` | Activate corridor |
| POST | `/api/signals/green-corridor/deactivate` | Deactivate |

### Predictions API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/predictions/` | List predictions |
| GET | `/api/predictions/{road}` | Get road prediction |
| POST | `/api/predictions/predict` | Generate prediction |
| POST | `/api/predictions/batch-predict` | Batch predictions |

## Deployment Architecture

### Development
```
Local Machine
├── Mobile: Expo Dev Server (port 8081)
├── Backend: Uvicorn (port 8000)
├── MongoDB: Local (port 27017)
└── AI: Jupyter/Script (local GPU/CPU)
```

### Production
```
┌─────────────────────────────────────────────────────┐
│                  Load Balancer                       │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
   ┌────────┐ ┌────────┐ ┌────────┐
   │API Pod1│ │API Pod2│ │API Pod3│  (FastAPI + Uvicorn)
   └────┬───┘ └────┬───┘ └────┬───┘
        │          │          │
        └──────────┼──────────┘
                   ▼
         ┌─────────────────┐
         │  MongoDB Atlas  │  (Replica Set)
         └─────────────────┘
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
   ┌────────┐ ┌────────┐ ┌────────┐
   │AI Pod1 │ │AI Pod2 │ │AI Pod3 │  (GPU-enabled for YOLO)
   └────────┘ └────────┘ └────────┘
```

### Scaling Considerations
- **API**: Stateless, horizontal scaling via Kubernetes HPA
- **WebSocket**: Sticky sessions or Redis adapter for multi-pod
- **MongoDB**: Atlas auto-scaling, read replicas for queries
- **AI**: Batch inference queue (Celery/RQ), GPU autoscaling

## Security

### Authentication (Planned)
- JWT tokens with role claims
- Roles: `emergency_operator`, `traffic_operator`, `admin`
- Token refresh mechanism

### Authorization Matrix
| Resource | Emergency Op | Traffic Op | Admin |
|----------|--------------|------------|-------|
| Roads (read) | ✅ | ✅ | ✅ |
| Roads (write) | ❌ | ✅ | ✅ |
| Incidents (read) | ✅ | ✅ | ✅ |
| Incidents (write) | ✅ | ✅ | ✅ |
| Emergency Dispatch | ✅ | ❌ | ✅ |
| Green Corridor | ✅ | ✅ | ✅ |
| Signals (control) | ❌ | ✅ | ✅ |
| Predictions | ✅ | ✅ | ✅ |
| Analytics | ✅ | ✅ | ✅ |
| User Management | ❌ | ❌ | ✅ |

### Data Protection
- TLS 1.3 for all connections
- MongoDB encryption at rest
- No PII in traffic data
- Audit logging for critical operations

## Monitoring & Observability

### Health Checks
- `GET /health` - Service health
- `GET /api/traffic/roads` - DB connectivity
- WebSocket ping/pong

### Metrics (Prometheus-ready)
- Request latency (p50, p95, p99)
- Request rate
- Error rate
- Active WebSocket connections
- DB query latency
- AI inference time

### Logging
- Structured JSON logs
- Levels: DEBUG, INFO, WARNING, ERROR
- Correlation IDs for request tracing

---

*Last Updated: 2026-09-25*
*Version: 1.0.0*