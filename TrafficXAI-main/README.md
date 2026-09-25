# 🚦 TRAFFICX AI — Smart Traffic & Emergency Response System

> A comprehensive traffic monitoring and emergency vehicle routing system built with React Native (Expo), FastAPI, MongoDB, and AI-powered vehicle detection.

## 🎯 Overview

TRAFFICX AI is an integrated system that continuously monitors traffic conditions using AI-powered vehicle detection (YOLO), detects incidents in real-time, and optimizes emergency vehicle routes through intelligent algorithms and green corridor simulation.

### Core Flow
```
📹 Camera/Sensor → 🤖 YOLO Detection → 📊 Traffic Analysis → 🚨 Incident Detection 
                                                    ↓
🗺️ Route Optimization ← 🧠 AI Engine ← 📈 Prediction
                                                    ↓
🚦 Green Corridor → 🚑 Ambulance → 🏥 Hospital
```

## 🏗️ Architecture

```
trafficx-ai/
├── 📱 mobile/                 # React Native (Expo) App
│   ├── app/                   # Expo Router screens
│   │   ├── (auth)/            # Login & Role Selection
│   │   └── (tabs)/            # Main app tabs
│   │       ├── index.tsx      # Dashboard
│   │       ├── live-traffic.tsx  # Interactive Map
│   │       ├── emergency.tsx     # Emergency Response
│   │       ├── incidents.tsx     # Incident Management
│   │       ├── routes.tsx        # Route Optimizer
│   │       ├── ai-monitor.tsx    # AI Vehicle Detection
│   │       ├── signals.tsx       # Traffic Signals
│   │       ├── predictions.tsx   # Traffic Predictions
│   │       ├── analytics.tsx     # Analytics Dashboard
│   │       └── profile.tsx       # User Profile
│   ├── components/            # Reusable UI components
│   ├── hooks/                 # Custom React hooks
│   ├── contexts/              # React Context providers
│   ├── services/              # API & WebSocket clients
│   ├── types/                 # TypeScript definitions
│   └── constants/             # Theme & config
│
├── 🧠 backend/                # FastAPI Backend
│   ├── app/
│   │   ├── main.py            # FastAPI app entry
│   │   ├── api/               # REST endpoints
│   │   │   ├── traffic.py     # Traffic roads API
│   │   │   ├── emergency.py   # Emergency vehicles
│   │   │   ├── incidents.py   # Incident management
│   │   │   ├── routes.py      # Route optimization
│   │   │   ├── signals.py     # Traffic signals
│   │   │   └── predictions.py # Traffic predictions
│   │   ├── models/            # Pydantic models
│   │   ├── services/          # Business logic
│   │   │   ├── route_service.py      # Route cost algorithm
│   │   │   ├── emergency_service.py  # Emergency dispatch
│   │   │   ├── signal_service.py     # Green corridor
│   │   │   └── prediction_service.py # ML predictions
│   │   ├── websocket/         # Socket.IO real-time
│   │   └── database/          # MongoDB connection
│   └── requirements.txt
│
├── 🤖 ai/                     # AI Components
│   ├── vehicle_detection/     # YOLO vehicle detection
│   │   └── detector.py
│   ├── traffic_prediction/    # ML traffic prediction
│   │   └── predictor.py
│   └── incident_detection/    # Multi-source incident detection
│       └── detector.py
│
├── 📊 data/                   # Data storage
│   ├── traffic/
│   ├── incidents/
│   └── videos/
│
├── 📚 docs/                   # Documentation
└── .env.example
```

## ✨ Features

### 📱 Mobile App (React Native + Expo)
| Screen | Features |
|--------|----------|
| **Dashboard** | City status, stats cards, live map preview, simulation panel, incidents, road status, quick actions |
| **Live Map** | Interactive map (react-native-maps), road polylines, incident markers, ambulance tracking, hospital markers, signal states, layer toggles |
| **Emergency** | Fleet status, ambulance detail, green corridor visualization, route optimizer with cost comparison, demo controls |
| **Incidents** | Filterable list, incident details, add/edit/resolve, incident types (accident, road block, flooding, etc.) |
| **Routes** | Route configuration, cost algorithm visualization, comparison table, waypoints, green corridor signals |
| **AI Monitor** | Live camera feed with YOLO detection boxes, vehicle breakdown, density gauge, detection history, class confidence |
| **Signals** | Signal states, green corridor activation, junction details |
| **Predictions** | AI-powered 30/60 min forecasts, confidence bars, hourly trend chart |
| **Analytics** | Stats grid, traffic trend chart, incident breakdown, emergency response metrics |
| **Profile** | User stats, settings, danger zone |

### 🧠 Backend API (FastAPI)
- **REST Endpoints**: Traffic, Emergency, Incidents, Routes, Signals, Predictions
- **WebSocket**: Real-time updates via Socket.IO
- **Database**: MongoDB with async motor driver
- **Authentication**: JWT-ready (extendable)

### 🤖 AI Components
| Component | Technology | Purpose |
|-----------|------------|---------|
| Vehicle Detection | YOLOv8 + OpenCV | Real-time vehicle counting & classification |
| Traffic Prediction | RandomForest/GBM | 30/60 min density forecasts |
| Incident Detection | Multi-source fusion | Anomaly detection + video analysis |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB (local or Atlas)
- pnpm (recommended) or npm

### 1. Mobile App
```bash
cd trafficx-ai/mobile
pnpm install
pnpm start
# Press 'w' for web, 'a' for Android, 'i' for iOS
```

### 2. Backend API
```bash
cd trafficx-ai/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Configure MongoDB URI
python -m app.main
# API at http://localhost:8000
# WebSocket at ws://localhost:8000/ws
```

### 3. AI Services
```bash
cd trafficx-ai/ai/vehicle_detection
pip install ultralytics opencv-python
python detector.py  # Webcam demo

cd trafficx-ai/ai/traffic_prediction
python predictor.py  # Train & save model
```

### 4. Train Prediction Model
```bash
cd trafficx-ai/ai/traffic_prediction
python predictor.py
# Creates traffic_predictor.pkl
```

## 🔧 Configuration

### Environment Variables (`.env`)
```bash
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=trafficx_ai
JWT_SECRET=your-secret-key
GOOGLE_MAPS_API_KEY=your-key
OSRM_BASE_URL=http://localhost:5000
```

### Theme Colors (`mobile/constants/theme.ts`)
```typescript
Background:    #0B1220
Cards:         #111827
Primary:       #2563EB (Blue)
Success:       #22C55E (Green)
Warning:       #F59E0B (Yellow)
Danger:        #EF4444 (Red)
```

## 🎮 Demo Simulation

The app includes a **Demo Control Panel** for hackathon presentations:

```
🎮 DEMO CONTROLS
├── 📈 TRAFFIC SURGE    → Spike vehicles on Avinashi Road
├── 🚨 TRIGGER ACCIDENT → Create incident at Junction 4
├── 🚑 SEND AMBULANCE   → Dispatch AMB-002 to incident
├── 🚦 GREEN CORRIDOR   → Activate J1→J2→J3 signals
└── 🔄 RESET            → Return to normal state
```

**Demo Flow:**
```
1. Traffic Surge    → 🔴 CRITICAL congestion
2. Trigger Accident → 🚨 Alert generated
3. Send Ambulance   → 🚑 AMB-002 dispatched
4. Route Optimizer  → 🧠 Route C selected (cost: 28)
5. Green Corridor   → 🚦 J1,J2,J3 → GREEN
6. Ambulance Moves  → 🏥 Hospital arrival
```

## 📡 Real-Time Updates

WebSocket events for live synchronization:
```typescript
// Client subscription
socket.emit('subscribe', { channels: ['traffic', 'emergency', 'incidents'] });

// Server broadcasts
traffic_update     // Road density changes
incident_update    // New/resolved incidents
emergency_update   // Ambulance location, status
signal_update      // Signal state changes
route_update       // Route recommendations
prediction_update  // Forecast updates
alert              // System alerts
```

## 🧮 Route Cost Algorithm

```
Route Cost = Distance × 0.4 + Traffic × 0.4 + Incident Risk × 0.2

Example:
┌─────────┬──────────┬──────────┬───────────┬────────┐
│ Route   │ Distance │ Traffic  │ Incidents │ Cost   │
├─────────┼──────────┼──────────┼───────────┼────────┤
│ Route A │ 5.2 km   │ CRITICAL │ 🚨 Blocked│ 91     │
│ Route B │ 6.1 km   │ HIGH     │ Clear     │ 63     │
│ Route C │ 6.8 km   │ LOW      │ Clear     │ 28 ⭐  │
└─────────┴──────────┴──────────┴───────────┴────────┘
```

## 🚨 Exception Handling

The system handles 15+ failure scenarios:
| Exception | Handling |
|-----------|----------|
| GPS Unavailable | Show last known location, prompt enable |
| Internet Lost | Cache data, show OFFLINE banner, retry |
| Camera Failed | Use previous data, show warning |
| No Route Found | Show incidents, suggest alternatives |
| Hospital Full | Show available alternatives |
| Data Outdated | Display "Last updated: X min ago" |
| Ambulance Offline | Keep last position, restore on reconnect |
| GPS Jump | Sanity check, reject impossible moves |
| Duplicate Incident | Group by distance/time threshold |
| Low AI Confidence | Flag for operator verification |
| API Failure | Fallback to local route graph |
| Server Down | Show OFFLINE, keep demo functional |
| Low Battery | Warning (future enhancement) |
| Wrong Destination | Confirm before dispatch |
| Signal Conflict | Priority manager with operator confirmation |

## 🔐 Security

- JWT-based authentication (extendable)
- Role-based access: Emergency Operator, Traffic Operator, Admin
- API protection for critical operations
- Data privacy: minimal personal data storage

## 📊 Data Models

Key MongoDB collections:
```javascript
// traffic_roads
{ _id, id, name, vehicle_count, density, status, coordinates... }

// incidents
{ _id, id, type, location, severity, trafficImpact, status, description... }

// emergency_vehicles
{ _id, id, vehicleId, type, status, location, destination, lat, lng, speed, eta... }

// traffic_signals
{ _id, id, junctionId, junctionName, state, greenCorridor, vehicleCount, lat, lng... }

// routes
{ _id, id, name, distance, duration, trafficStatus, cost, waypoints, recommended... }
```

## 🛠️ Development

### Mobile App Commands
```bash
pnpm start          # Start Expo dev server
pnpm android        # Run on Android emulator
pnpm ios            # Run on iOS simulator
pnpm web            # Run in browser
pnpm lint           # Run ESLint
pnpm reset-project  # Reset to template
```

### Backend Commands
```bash
python -m app.main              # Run server (reload)
python -m app.main --no-reload  # Production
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 📦 Deployment

### Mobile (Expo/EAS)
```bash
eas build --platform all
eas submit --platform ios
eas submit --platform android
```

### Backend (Docker)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### MongoDB Atlas
1. Create cluster at cloud.mongodb.com
2. Get connection string
3. Update `MONGODB_URI` in `.env`
4. Configure network access

## 📝 License

MIT License - Feel free to use for hackathons, prototypes, and learning.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push and create PR

## 📞 Support

For questions or issues, please open a GitHub issue.

---

**Built for Hackathons** 🏆 | **React Native + FastAPI + AI** 🤖 | **Real-time + Offline-ready** 📡