# TRAFFICX AI — Incident Detection
import cv2
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class IncidentType(Enum):
    ACCIDENT = "ACCIDENT"
    CONGESTION = "CONGESTION"
    ROAD_BLOCK = "ROAD_BLOCK"
    SIGNAL_FAILURE = "SIGNAL_FAILURE"
    FLOODING = "FLOODING"
    VEHICLE_BREAKDOWN = "VEHICLE_BREAKDOWN"


class IncidentSeverity(Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


@dataclass
class Incident:
    """Detected incident"""
    type: IncidentType
    severity: IncidentSeverity
    location: str
    latitude: float
    longitude: float
    confidence: float
    description: str
    timestamp: str
    affected_lanes: int = 0
    estimated_duration: int = 0  # minutes


class IncidentDetector:
    """
    Multi-source incident detection combining:
    1. AI video analysis (YOLO + tracking)
    2. Traffic pattern anomalies
    3. Operator reports
    4. Sensor data
    """
    
    def __init__(self):
        # Congestion detection thresholds
        self.congestion_thresholds = {
            'density_critical': 85,      # % density
            'speed_drop': 0.5,           # 50% speed reduction
            'duration_minutes': 5,       # Sustained for 5 min
        }
        
        # Accident detection
        self.accident_indicators = {
            'sudden_stop': True,
            'vehicle_cluster': True,
            'wrong_direction': True,
            'debris_detection': False,  # Requires specific model
        }
        
        # Historical baseline for anomaly detection
        self.baseline_traffic = {}
        
    def detect_from_traffic_data(
        self, 
        road_id: str,
        current_data: Dict[str, Any],
        historical_data: List[Dict] = None
    ) -> List[Incident]:
        """
        Detect incidents from traffic data anomalies
        
        Args:
            road_id: Road identifier
            current_data: Current traffic state
            historical_data: Recent historical data for baseline
            
        Returns:
            List of detected incidents
        """
        incidents = []
        
        # Update baseline
        self._update_baseline(road_id, current_data, historical_data)
        
        # Check for congestion
        congestion = self._detect_congestion(road_id, current_data)
        if congestion:
            incidents.append(congestion)
        
        # Check for accident indicators
        accident = self._detect_accident_patterns(road_id, current_data)
        if accident:
            incidents.append(accident)
        
        # Check for road block
        road_block = self._detect_road_block(road_id, current_data)
        if road_block:
            incidents.append(road_block)
        
        return incidents
    
    def _update_baseline(
        self, 
        road_id: str, 
        current: Dict, 
        historical: List[Dict] = None
    ):
        """Update traffic baseline for anomaly detection"""
        if road_id not in self.baseline_traffic:
            self.baseline_traffic[road_id] = {
                'vehicle_count': [],
                'density': [],
                'speed': [],
            }
        
        baseline = self.baseline_traffic[road_id]
        baseline['vehicle_count'].append(current.get('vehicle_count', 0))
        baseline['density'].append(current.get('density', 0))
        baseline['speed'].append(current.get('avg_speed', 30))
        
        # Keep last 100 readings
        for key in baseline:
            if len(baseline[key]) > 100:
                baseline[key] = baseline[key][-100:]
    
    def _detect_congestion(
        self, 
        road_id: str, 
        current: Dict
    ) -> Optional[Incident]:
        """Detect traffic congestion"""
        density = current.get('density', 0)
        vehicle_count = current.get('vehicle_count', 0)
        
        if density >= self.congestion_thresholds['density_critical']:
            # Determine severity
            if density >= 95:
                severity = IncidentSeverity.CRITICAL
            elif density >= 85:
                severity = IncidentSeverity.HIGH
            else:
                severity = IncidentSeverity.MEDIUM
            
            return Incident(
                type=IncidentType.CONGESTION,
                severity=severity,
                location=current.get('location', f'Road {road_id}'),
                latitude=current.get('lat', 0),
                longitude=current.get('lng', 0),
                confidence=min(95, 70 + density * 0.3),
                description=f"Heavy congestion detected. Density: {density:.0f}%, Vehicles: {vehicle_count}",
                timestamp=current.get('timestamp', ''),
            )
        
        return None
    
    def _detect_accident_patterns(
        self, 
        road_id: str, 
        current: Dict
    ) -> Optional[Incident]:
        """
        Detect accident patterns from traffic data
        In production, this would use computer vision on CCTV feeds
        """
        # Simplified: detect sudden traffic drop (vehicles stopping)
        baseline = self.baseline_traffic.get(road_id, {})
        if not baseline or len(baseline.get('vehicle_count', [])) < 10:
            return None
        
        recent_counts = baseline['vehicle_count'][-10:]
        current_count = current.get('vehicle_count', 0)
        avg_recent = np.mean(recent_counts)
        
        # Sudden drop in throughput (vehicles not moving through)
        if avg_recent > 0 and current_count < avg_recent * 0.3:
            # Potential accident - vehicles backing up
            return Incident(
                type=IncidentType.ACCIDENT,
                severity=IncidentSeverity.HIGH,
                location=current.get('location', f'Road {road_id}'),
                latitude=current.get('lat', 0),
                longitude=current.get('lng', 0),
                confidence=75,
                description=f"Possible accident: throughput dropped {((avg_recent-current_count)/avg_recent)*100:.0f}%. Vehicles may be stopped.",
                timestamp=current.get('timestamp', ''),
                affected_lanes=2,
                estimated_duration=30,
            )
        
        return None
    
    def _detect_road_block(
        self, 
        road_id: str, 
        current: Dict
    ) -> Optional[Incident]:
        """Detect road blockage"""
        # Check for zero throughput with high density (complete blockage)
        density = current.get('density', 0)
        vehicle_count = current.get('vehicle_count', 0)
        speed = current.get('avg_speed', 30)
        
        if density > 50 and speed < 5 and vehicle_count > 20:
            return Incident(
                type=IncidentType.ROAD_BLOCK,
                severity=IncidentSeverity.HIGH,
                location=current.get('location', f'Road {road_id}'),
                latitude=current.get('lat', 0),
                longitude=current.get('lng', 0),
                confidence=80,
                description=f"Road blockage suspected: High density ({density:.0f}%) with near-zero speed ({speed:.0f} km/h)",
                timestamp=current.get('timestamp', ''),
                affected_lanes=3,
                estimated_duration=60,
            )
        
        return None
    
    def detect_from_video(
        self, 
        frame: np.ndarray,
        detections: List[Any],  # YOLO detections
        road_info: Dict
    ) -> List[Incident]:
        """
        Detect incidents from video analysis
        
        Args:
            frame: Current video frame
            detections: Vehicle detections from YOLO
            road_info: Road metadata (location, lanes, etc.)
            
        Returns:
            List of detected incidents
        """
        incidents = []
        
        # Vehicle clustering detection (potential accident)
        cluster_incident = self._detect_vehicle_clusters(detections, road_info)
        if cluster_incident:
            incidents.append(cluster_incident)
        
        # Wrong-way driving detection
        wrong_way = self._detect_wrong_way(detections, road_info)
        if wrong_way:
            incidents.append(wrong_way)
        
        # Stopped vehicle detection
        stopped = self._detect_stopped_vehicles(detections, road_info)
        if stopped:
            incidents.extend(stopped)
        
        return incidents
    
    def _detect_vehicle_clusters(
        self, 
        detections: List[Any], 
        road_info: Dict
    ) -> Optional[Incident]:
        """Detect unusual vehicle clustering (potential accident)"""
        if len(detections) < 3:
            return None
        
        # Simple clustering: check if vehicles are unusually close
        centers = [d.center for d in detections if hasattr(d, 'center')]
        if len(centers) < 3:
            return None
        
        # Calculate pairwise distances
        close_pairs = 0
        for i in range(len(centers)):
            for j in range(i+1, len(centers)):
                dist = np.sqrt(
                    (centers[i][0] - centers[j][0])**2 + 
                    (centers[i][1] - centers[j][1])**2
                )
                if dist < 50:  # pixels - would need calibration
                    close_pairs += 1
        
        # If many vehicles clustered in small area
        if close_pairs >= 3:
            return Incident(
                type=IncidentType.ACCIDENT,
                severity=IncidentSeverity.HIGH,
                location=road_info.get('location', 'Unknown'),
                latitude=road_info.get('lat', 0),
                longitude=road_info.get('lng', 0),
                confidence=70,
                description=f"Vehicle cluster detected: {len(detections)} vehicles in close proximity. Possible collision.",
                timestamp=datetime.now().isoformat(),
                affected_lanes=2,
            )
        
        return None
    
    def _detect_wrong_way(
        self, 
        detections: List[Any], 
        road_info: Dict
    ) -> Optional[Incident]:
        """Detect wrong-way driving"""
        # Would need tracking and direction analysis
        # Placeholder for future implementation
        return None
    
    def _detect_stopped_vehicles(
        self, 
        detections: List[Any], 
        road_info: Dict
    ) -> List[Incident]:
        """Detect vehicles stopped for extended period"""
        # Would need temporal tracking
        # Placeholder for future implementation
        return []
    
    def fuse_incidents(
        self, 
        incidents: List[Incident],
        distance_threshold: float = 0.001,  # ~100m
        time_threshold: int = 300  # 5 minutes
    ) -> List[Incident]:
        """
        Fuse duplicate incident reports from multiple sources
        
        Args:
            incidents: List of incidents from different sources
            distance_threshold: Max distance for same incident (degrees)
            time_threshold: Max time difference (seconds)
            
        Returns:
            Deduplicated incident list
        """
        if not incidents:
            return []
        
        fused = []
        used = set()
        
        for i, inc1 in enumerate(incidents):
            if i in used:
                continue
            
            # Find similar incidents
            similar = [inc1]
            for j, inc2 in enumerate(incidents):
                if i == j or j in used:
                    continue
                
                # Check distance
                dist = np.sqrt(
                    (inc1.latitude - inc2.latitude)**2 + 
                    (inc1.longitude - inc2.longitude)**2
                )
                
                # Check time
                try:
                    t1 = datetime.fromisoformat(inc1.timestamp.replace('Z', '+00:00'))
                    t2 = datetime.fromisoformat(inc2.timestamp.replace('Z', '+00:00'))
                    time_diff = abs((t1 - t2).total_seconds())
                except:
                    time_diff = float('inf')
                
                if dist < distance_threshold and time_diff < time_threshold:
                    similar.append(inc2)
                    used.add(j)
            
            # Merge similar incidents
            if len(similar) > 1:
                # Take highest severity, average location, combined confidence
                max_severity = max(s.severity for s in similar)
                avg_lat = np.mean([s.latitude for s in similar])
                avg_lng = np.mean([s.longitude for s in similar])
                avg_conf = np.mean([s.confidence for s in similar])
                
                fused_incident = Incident(
                    type=similar[0].type,
                    severity=max_severity,
                    location=similar[0].location,
                    latitude=avg_lat,
                    longitude=avg_lng,
                    confidence=min(95, avg_conf + 5 * (len(similar) - 1)),
                    description=f"Confirmed by {len(similar)} sources: {similar[0].description}",
                    timestamp=min(s.timestamp for s in similar),
                )
                fused.append(fused_incident)
            else:
                fused.append(inc1)
            
            used.add(i)
        
        return fused


def create_incident_detector() -> IncidentDetector:
    """Create incident detector with default settings"""
    return IncidentDetector()


if __name__ == "__main__":
    # Demo
    detector = create_incident_detector()
    
    # Simulate traffic data
    current = {
        'road_id': 'R1',
        'vehicle_count': 45,
        'density': 92,
        'avg_speed': 8,
        'location': 'Avinashi Road - Signal 7',
        'lat': 11.0136,
        'lng': 77.0247,
        'timestamp': datetime.now().isoformat(),
    }
    
    # Build baseline
    for _ in range(20):
        detector._update_baseline('R1', {
            'vehicle_count': np.random.randint(15, 25),
            'density': np.random.randint(30, 50),
            'avg_speed': np.random.randint(25, 40),
        })
    
    # Detect
    incidents = detector.detect_from_traffic_data('R1', current)
    
    for inc in incidents:
        print(f"Detected: {inc.type.value} - {inc.severity.value}")
        print(f"  Location: {inc.location}")
        print(f"  Confidence: {inc.confidence:.0f}%")
        print(f"  Description: {inc.description}")