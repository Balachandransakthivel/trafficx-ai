// TRAFFICX AI — Global Traffic State Context
import React, { createContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import {
  TrafficRoad, Incident, EmergencyVehicle,
  TrafficSignal, Route, Alert, VehicleDetection
} from '@/types/traffic';
import {
  getTrafficRoads, getIncidents, getEmergencyVehicles,
  getTrafficSignals, getRoutes, getVehicleDetection, getAlerts
} from '@/services/mockData';

interface SimulationState {
  accidentTriggered: boolean;
  ambulanceDeployed: boolean;
  greenCorridorActive: boolean;
  trafficSurge: boolean;
  scenarioStep: number; // 0=normal,1=surge,2=accident,3=ambulance,4=route,5=corridor,6=arrived
}

interface TrafficContextType {
  roads: TrafficRoad[];
  incidents: Incident[];
  vehicles: EmergencyVehicle[];
  signals: TrafficSignal[];
  routes: Route[];
  detection: VehicleDetection;
  alerts: Alert[];
  simulation: SimulationState;
  unreadAlerts: number;
  isLive: boolean;
  // Actions
  triggerAccident: () => void;
  sendAmbulance: () => void;
  activateGreenCorridor: () => void;
  triggerTrafficSurge: () => void;
  resetSimulation: () => void;
  markAllAlertsRead: () => void;
}

export const TrafficContext = createContext<TrafficContextType | undefined>(undefined);

export function TrafficProvider({ children }: { children: ReactNode }) {
  const [roads, setRoads] = useState<TrafficRoad[]>(getTrafficRoads());
  const [incidents, setIncidents] = useState<Incident[]>(getIncidents());
  const [vehicles, setVehicles] = useState<EmergencyVehicle[]>(getEmergencyVehicles());
  const [signals, setSignals] = useState<TrafficSignal[]>(getTrafficSignals());
  const [routes, setRoutes] = useState<Route[]>(getRoutes());
  const [detection, setDetection] = useState<VehicleDetection>(getVehicleDetection());
  const [alerts, setAlerts] = useState<Alert[]>(getAlerts());
  const [isLive, setIsLive] = useState(true);

  const [simulation, setSimulation] = useState<SimulationState>({
    accidentTriggered: false,
    ambulanceDeployed: false,
    greenCorridorActive: false,
    trafficSurge: false,
    scenarioStep: 0,
  });

  const liveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulate live traffic fluctuations
  useEffect(() => {
    liveIntervalRef.current = setInterval(() => {
      setRoads(prev => prev.map(r => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const newCount = Math.max(1, r.vehicleCount + delta);
        const density = Math.min(100, Math.round((newCount / 50) * 100));
        const status: TrafficRoad['status'] =
          newCount <= 10 ? 'LOW' :
          newCount <= 25 ? 'MEDIUM' :
          newCount <= 40 ? 'HIGH' : 'CRITICAL';
        return { ...r, vehicleCount: newCount, density, status };
      }));
      setDetection(prev => {
        const delta = Math.floor(Math.random() * 4) - 2;
        const total = Math.max(5, prev.totalVehicles + delta);
        return { ...prev, totalVehicles: total, density: Math.min(100, Math.round((total / 50) * 100)) };
      });
    }, 3000);

    return () => {
      if (liveIntervalRef.current) clearInterval(liveIntervalRef.current);
    };
  }, []);

  const addAlert = useCallback((alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => {
    const newAlert: Alert = {
      ...alert,
      id: `A${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setAlerts(prev => [newAlert, ...prev].slice(0, 20));
  }, []);

  const triggerTrafficSurge = useCallback(() => {
    setRoads(prev => prev.map(r =>
      r.id === 'R1' ? { ...r, vehicleCount: 52, density: 94, status: 'CRITICAL' } : r
    ));
    setDetection(prev => ({ ...prev, totalVehicles: 52, cars: 34, density: 94, trafficStatus: 'CRITICAL' }));
    setSimulation(prev => ({ ...prev, trafficSurge: true, scenarioStep: Math.max(prev.scenarioStep, 1) }));
    addAlert({ type: 'INFO', title: 'Traffic Surge Detected', message: 'Avinashi Road: vehicle count spiked to 52. Status: CRITICAL.' });
  }, [addAlert]);

  const triggerAccident = useCallback(() => {
    const newIncident: Incident = {
      id: `I${Date.now()}`,
      type: 'ACCIDENT',
      location: 'NH Road – Junction 4',
      lat: 10.9990,
      lng: 77.0251,
      severity: 'HIGH',
      trafficImpact: 'CRITICAL',
      status: 'ACTIVE',
      timestamp: new Date().toISOString(),
      description: 'AI DETECTED: Multi-vehicle collision. 2 lanes blocked. Emergency response required.',
    };
    setIncidents(prev => [newIncident, ...prev]);
    setRoads(prev => prev.map(r =>
      r.id === 'R5' ? { ...r, vehicleCount: 48, density: 96, status: 'CRITICAL' } : r
    ));
    setSimulation(prev => ({ ...prev, accidentTriggered: true, scenarioStep: Math.max(prev.scenarioStep, 2) }));
    addAlert({ type: 'INCIDENT', title: '🚨 Accident Detected', message: 'NH Road – Junction 4. Severity: HIGH. Emergency response required.' });
  }, [addAlert]);

  const sendAmbulance = useCallback(() => {
    setVehicles(prev => prev.map(v =>
      v.vehicleId === 'AMB-002' ? {
        ...v,
        status: 'EMERGENCY',
        currentLocation: 'RS Puram Base',
        destination: 'NH Road – Junction 4',
        destLat: 10.9990,
        destLng: 77.0251,
        speed: 72,
        eta: 6,
      } : v
    ));
    setSimulation(prev => ({ ...prev, ambulanceDeployed: true, scenarioStep: Math.max(prev.scenarioStep, 3) }));
    addAlert({ type: 'EMERGENCY', title: '🚑 Ambulance Dispatched', message: 'AMB-002 deployed from RS Puram. Destination: NH Road Junction 4.' });
  }, [addAlert]);

  const activateGreenCorridor = useCallback(() => {
    setSignals(prev => prev.map(s =>
      ['SIG1', 'SIG2', 'SIG3'].includes(s.id)
        ? { ...s, state: 'GREEN', greenCorridor: true }
        : { ...s, state: 'RED', greenCorridor: false }
    ));
    setRoutes(prev => prev.map(r => ({
      ...r,
      recommended: r.id === 'ROUTE_C',
    })));
    setSimulation(prev => ({ ...prev, greenCorridorActive: true, scenarioStep: Math.max(prev.scenarioStep, 5) }));
    addAlert({ type: 'CORRIDOR', title: '🚦 Green Corridor Active', message: 'J1 → J2 → J3 cleared for AMB-001. All signals GREEN.' });
  }, [addAlert]);

  const resetSimulation = useCallback(() => {
    setRoads(getTrafficRoads());
    setIncidents(getIncidents());
    setVehicles(getEmergencyVehicles());
    setSignals(getTrafficSignals());
    setRoutes(getRoutes());
    setDetection(getVehicleDetection());
    setSimulation({
      accidentTriggered: false,
      ambulanceDeployed: false,
      greenCorridorActive: false,
      trafficSurge: false,
      scenarioStep: 0,
    });
    addAlert({ type: 'INFO', title: 'Simulation Reset', message: 'All systems returned to normal state.' });
  }, [addAlert]);

  const markAllAlertsRead = useCallback(() => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  }, []);

  const unreadAlerts = alerts.filter(a => !a.read).length;

  return (
    <TrafficContext.Provider value={{
      roads, incidents, vehicles, signals, routes,
      detection, alerts, simulation, unreadAlerts, isLive,
      triggerAccident, sendAmbulance, activateGreenCorridor,
      triggerTrafficSurge, resetSimulation, markAllAlertsRead,
    }}>
      {children}
    </TrafficContext.Provider>
  );
}
