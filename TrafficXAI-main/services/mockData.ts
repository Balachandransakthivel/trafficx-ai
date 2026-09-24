// TRAFFICX AI — Mock Data Service (Stage 1: Frontend-First)
import {
  TrafficRoad, Incident, EmergencyVehicle,
  TrafficSignal, Route, VehicleDetection,
  TrafficPrediction, Alert, TrafficStatus
} from '@/types/traffic';

export function getTrafficRoads(): TrafficRoad[] {
  return [
    {
      id: 'R1', name: 'Avinashi Road',
      vehicleCount: 38, density: 82, status: 'CRITICAL',
      lat: 11.0136, lng: 77.0247,
      fromLat: 11.0168, fromLng: 77.0061,
      toLat: 11.0104, toLng: 77.0432,
    },
    {
      id: 'R2', name: 'DB Road',
      vehicleCount: 22, density: 51, status: 'HIGH',
      lat: 10.9978, lng: 76.9880,
      fromLat: 11.0005, fromLng: 76.9691,
      toLat: 10.9951, toLng: 77.0069,
    },
    {
      id: 'R3', name: 'Trichy Road',
      vehicleCount: 12, density: 28, status: 'MEDIUM',
      lat: 10.9852, lng: 77.0200,
      fromLat: 10.9951, fromLng: 77.0069,
      toLat: 10.9752, toLng: 77.0330,
    },
    {
      id: 'R4', name: 'Mettupalayam Road',
      vehicleCount: 7, density: 16, status: 'LOW',
      lat: 11.0087, lng: 76.9876,
      fromLat: 11.0168, fromLng: 77.0061,
      toLat: 11.0005, toLng: 76.9691,
    },
    {
      id: 'R5', name: 'NH Road',
      vehicleCount: 28, density: 64, status: 'HIGH',
      lat: 11.0028, lng: 77.0251,
      fromLat: 11.0104, fromLng: 77.0432,
      toLat: 10.9951, toLng: 77.0069,
    },
  ];
}

export function getIncidents(): Incident[] {
  return [
    {
      id: 'I1',
      type: 'ACCIDENT',
      location: 'NH Road – Junction 4',
      lat: 10.9990,
      lng: 77.0251,
      severity: 'HIGH',
      trafficImpact: 'CRITICAL',
      status: 'ACTIVE',
      timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
      description: 'Multi-vehicle collision, 2 lanes blocked. Emergency services required.',
    },
    {
      id: 'I2',
      type: 'CONGESTION',
      location: 'Avinashi Road – Signal 7',
      lat: 11.0136,
      lng: 77.0247,
      severity: 'MEDIUM',
      trafficImpact: 'HIGH',
      status: 'MONITORING',
      timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
      description: 'Heavy vehicle buildup at intersection. Signal timing adjusted.',
    },
    {
      id: 'I3',
      type: 'ROAD_BLOCK',
      location: 'DB Road – Bypass',
      lat: 11.0005,
      lng: 76.9691,
      severity: 'LOW',
      trafficImpact: 'MEDIUM',
      status: 'RESOLVED',
      timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
      description: 'Temporary road work cleared. Traffic flowing normally.',
    },
  ];
}

export function getEmergencyVehicles(): EmergencyVehicle[] {
  return [
    {
      id: 'EV1',
      vehicleId: 'AMB-001',
      type: 'AMBULANCE',
      driverName: 'Dr. Ramesh Kumar',
      status: 'EN_ROUTE',
      currentLocation: 'Junction 4 – Ganapathy',
      destination: 'Government Hospital',
      lat: 10.9951,
      lng: 77.0069,
      destLat: 11.0100,
      destLng: 77.0155,
      speed: 42,
      eta: 8,
      routeId: 'ROUTE_C',
    },
    {
      id: 'EV2',
      vehicleId: 'AMB-002',
      type: 'AMBULANCE',
      driverName: 'Nurse Priya S.',
      status: 'STANDBY',
      currentLocation: 'KMCH Hospital',
      destination: '',
      lat: 11.0138,
      lng: 77.0330,
      destLat: 11.0138,
      destLng: 77.0330,
      speed: 0,
      eta: 0,
    },
    {
      id: 'EV3',
      vehicleId: 'FIRE-01',
      type: 'FIRE',
      driverName: 'Suresh Babu',
      status: 'EMERGENCY',
      currentLocation: 'Anna Nagar',
      destination: 'NH Road – Junction 4',
      lat: 11.0168,
      lng: 77.0061,
      destLat: 10.9990,
      destLng: 77.0251,
      speed: 67,
      eta: 5,
    },
  ];
}

export function getTrafficSignals(): TrafficSignal[] {
  return [
    { id: 'SIG1', junctionId: 'J1', junctionName: 'Junction 1 – Anna Nagar', state: 'GREEN', greenCorridor: true, vehicleCount: 14, lat: 11.0168, lng: 77.0061 },
    { id: 'SIG2', junctionId: 'J2', junctionName: 'Junction 2 – RS Puram', state: 'GREEN', greenCorridor: true, vehicleCount: 9, lat: 11.0005, lng: 76.9691 },
    { id: 'SIG3', junctionId: 'J3', junctionName: 'Junction 3 – Peelamedu', state: 'GREEN', greenCorridor: true, vehicleCount: 22, lat: 11.0104, lng: 77.0432 },
    { id: 'SIG4', junctionId: 'J4', junctionName: 'Junction 4 – Ganapathy', state: 'RED', greenCorridor: false, vehicleCount: 41, lat: 10.9951, lng: 77.0069 },
    { id: 'SIG5', junctionId: 'J5', junctionName: 'Junction 5 – Singanallur', state: 'YELLOW', greenCorridor: false, vehicleCount: 17, lat: 10.9752, lng: 77.0330 },
  ];
}

export function getRoutes(): Route[] {
  return [
    {
      id: 'ROUTE_A',
      name: 'Route A – Avinashi Road',
      distance: 5.2,
      duration: 22,
      trafficStatus: 'CRITICAL',
      cost: 91,
      waypoints: ['J1', 'J3', 'J4'],
      recommended: false,
      blocked: true,
    },
    {
      id: 'ROUTE_B',
      name: 'Route B – DB Road',
      distance: 6.1,
      duration: 16,
      trafficStatus: 'HIGH',
      cost: 63,
      waypoints: ['J1', 'J2', 'J4'],
      recommended: false,
      blocked: false,
    },
    {
      id: 'ROUTE_C',
      name: 'Route C – Mettupalayam Bypass',
      distance: 6.8,
      duration: 12,
      trafficStatus: 'LOW',
      cost: 28,
      waypoints: ['J1', 'J2', 'J5', 'H1'],
      recommended: true,
      blocked: false,
    },
  ];
}

export function getVehicleDetection(): VehicleDetection {
  return {
    totalVehicles: 37,
    cars: 22,
    bikes: 10,
    buses: 3,
    trucks: 2,
    ambulances: 0,
    trafficStatus: 'HIGH',
    density: 74,
    confidence: 93.4,
  };
}

export function getTrafficPredictions(): TrafficPrediction[] {
  return [
    { roadName: 'Avinashi Road', currentStatus: 'HIGH', prediction30min: 'CRITICAL', prediction60min: 'CRITICAL', confidence: 87, peakHour: '5:30 PM' },
    { roadName: 'Trichy Road', currentStatus: 'MEDIUM', prediction30min: 'HIGH', prediction60min: 'HIGH', confidence: 79, peakHour: '6:00 PM' },
    { roadName: 'DB Road', currentStatus: 'HIGH', prediction30min: 'HIGH', prediction60min: 'MEDIUM', confidence: 82, peakHour: '4:45 PM' },
    { roadName: 'Mettupalayam Road', currentStatus: 'LOW', prediction30min: 'LOW', prediction60min: 'MEDIUM', confidence: 91, peakHour: '7:00 PM' },
    { roadName: 'NH Road', currentStatus: 'HIGH', prediction30min: 'CRITICAL', prediction60min: 'HIGH', confidence: 85, peakHour: '5:15 PM' },
  ];
}

export function getAlerts(): Alert[] {
  const now = Date.now();
  return [
    { id: 'A1', type: 'INCIDENT', title: 'Accident Detected', message: 'NH Road – Junction 4. Severity: HIGH. Emergency response dispatched.', timestamp: new Date(now - 2 * 60000).toISOString(), read: false },
    { id: 'A2', type: 'EMERGENCY', title: 'Ambulance Approaching', message: 'AMB-001 approaching Junction 3 via Route C. Green corridor active.', timestamp: new Date(now - 4 * 60000).toISOString(), read: false },
    { id: 'A3', type: 'CORRIDOR', title: 'Green Corridor Activated', message: 'J1 → J2 → J3 cleared for AMB-001. ETA 8 min.', timestamp: new Date(now - 5 * 60000).toISOString(), read: false },
    { id: 'A4', type: 'PREDICTION', title: 'Heavy Traffic Predicted', message: 'Avinashi Road expected CRITICAL in 30 min. Consider rerouting.', timestamp: new Date(now - 15 * 60000).toISOString(), read: true },
    { id: 'A5', type: 'INFO', title: 'Traffic Surge Detected', message: 'Vehicle count on Avinashi Road jumped from 18 to 38. Signals adjusted.', timestamp: new Date(now - 28 * 60000).toISOString(), read: true },
  ];
}

export function getAnalyticsData() {
  return {
    stats: [
      { label: 'Total Incidents', value: 24, change: -8, unit: 'this week' },
      { label: 'Resolved', value: 21, change: 12, unit: 'resolved' },
      { label: 'Active', value: 3, change: 0, unit: 'ongoing' },
      { label: 'Emergency Responses', value: 18, change: 5, unit: 'dispatched' },
      { label: 'Green Corridors', value: 12, change: 20, unit: 'activated' },
      { label: 'Avg Response Time', value: '6.2', change: -15, unit: 'minutes' },
      { label: 'Roads Monitored', value: 23, change: 0, unit: 'total' },
      { label: 'Time Saved', value: '142', change: 18, unit: 'minutes saved' },
    ],
    trafficTrend: [
      { hour: '08:00', vehicles: 28 },
      { hour: '09:00', vehicles: 41 },
      { hour: '10:00', vehicles: 35 },
      { hour: '11:00', vehicles: 29 },
      { hour: '12:00', vehicles: 32 },
      { hour: '13:00', vehicles: 37 },
      { hour: '14:00', vehicles: 30 },
      { hour: '15:00', vehicles: 25 },
      { hour: '16:00', vehicles: 38 },
      { hour: '17:00', vehicles: 52 },
      { hour: '18:00', vehicles: 47 },
    ],
  };
}

export function getStatusColor(status: TrafficStatus | IncidentSeverity): string {
  switch (status) {
    case 'LOW': return '#22c55e';
    case 'MEDIUM': return '#f59e0b';
    case 'HIGH': return '#f97316';
    case 'CRITICAL': return '#ef4444';
    default: return '#8892a4';
  }
}

export function getStatusLabel(status: TrafficStatus): string {
  switch (status) {
    case 'LOW': return '🟢 LOW';
    case 'MEDIUM': return '🟡 MEDIUM';
    case 'HIGH': return '🟠 HIGH';
    case 'CRITICAL': return '🔴 CRITICAL';
    default: return status;
  }
}

type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
