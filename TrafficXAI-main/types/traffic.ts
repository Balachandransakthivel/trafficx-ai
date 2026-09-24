// TRAFFICX AI — Core Types

export type TrafficStatus = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type EmergencyStatus = 'STANDBY' | 'EMERGENCY' | 'EN_ROUTE' | 'ARRIVED';
export type SignalState = 'GREEN' | 'YELLOW' | 'RED';

export interface TrafficRoad {
  id: string;
  name: string;
  vehicleCount: number;
  density: number;
  status: TrafficStatus;
  lat: number;
  lng: number;
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
}

export interface Incident {
  id: string;
  type: 'ACCIDENT' | 'CONGESTION' | 'ROAD_BLOCK' | 'VEHICLE_BREAKDOWN';
  location: string;
  lat: number;
  lng: number;
  severity: IncidentSeverity;
  trafficImpact: TrafficStatus;
  status: 'ACTIVE' | 'RESOLVED' | 'MONITORING';
  timestamp: string;
  description: string;
}

export interface EmergencyVehicle {
  id: string;
  vehicleId: string;
  type: 'AMBULANCE' | 'FIRE' | 'POLICE';
  driverName: string;
  status: EmergencyStatus;
  currentLocation: string;
  destination: string;
  lat: number;
  lng: number;
  destLat: number;
  destLng: number;
  speed: number;
  eta: number; // minutes
  routeId?: string;
}

export interface TrafficSignal {
  id: string;
  junctionId: string;
  junctionName: string;
  state: SignalState;
  greenCorridor: boolean;
  vehicleCount: number;
  lat: number;
  lng: number;
}

export interface Route {
  id: string;
  name: string;
  distance: number; // km
  duration: number; // minutes
  trafficStatus: TrafficStatus;
  cost: number; // algorithm score
  waypoints: string[];
  recommended: boolean;
  blocked: boolean;
}

export interface VehicleDetection {
  totalVehicles: number;
  cars: number;
  bikes: number;
  buses: number;
  trucks: number;
  ambulances: number;
  trafficStatus: TrafficStatus;
  density: number;
  confidence: number;
}

export interface TrafficPrediction {
  roadName: string;
  currentStatus: TrafficStatus;
  prediction30min: TrafficStatus;
  prediction60min: TrafficStatus;
  confidence: number;
  peakHour: string;
}

export interface Alert {
  id: string;
  type: 'INCIDENT' | 'EMERGENCY' | 'PREDICTION' | 'CORRIDOR' | 'INFO';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface AnalyticsStat {
  label: string;
  value: number | string;
  change?: number;
  unit?: string;
}
