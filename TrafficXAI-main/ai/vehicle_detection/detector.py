# TRAFFICX AI — YOLO Vehicle Detection
import cv2
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from ultralytics import YOLO
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class Detection:
    """Single vehicle detection result"""
    class_name: str
    class_id: int
    confidence: float
    bbox: Tuple[int, int, int, int]  # x1, y1, x2, y2
    center: Tuple[int, int]


@dataclass
class TrafficAnalysis:
    """Aggregated traffic analysis from detections"""
    total_vehicles: int
    cars: int
    bikes: int
    buses: int
    trucks: int
    ambulances: int
    fire_trucks: int
    density: float
    traffic_status: str
    avg_confidence: float
    detections: List[Detection]


class VehicleDetector:
    """YOLO-based vehicle detector for traffic monitoring"""
    
    # COCO class IDs for vehicles
    VEHICLE_CLASSES = {
        2: 'car',
        3: 'motorcycle',  # bike
        5: 'bus',
        7: 'truck',
        # Note: Ambulance/Fire truck detection requires custom model
    }
    
    # Traffic density thresholds (vehicles per frame/area)
    DENSITY_THRESHOLDS = {
        'LOW': (0, 10),
        'MEDIUM': (11, 25),
        'HIGH': (26, 40),
        'CRITICAL': (41, float('inf')),
    }
    
    def __init__(
        self, 
        model_path: str = 'yolov8n.pt',
        confidence_threshold: float = 0.5,
        device: str = 'cpu'
    ):
        """
        Initialize vehicle detector
        
        Args:
            model_path: Path to YOLO model weights
            confidence_threshold: Minimum confidence for detections
            device: 'cpu' or 'cuda'
        """
        self.confidence_threshold = confidence_threshold
        self.device = device
        
        try:
            self.model = YOLO(model_path)
            self.model.to(device)
            logger.info(f"Loaded YOLO model: {model_path} on {device}")
        except Exception as e:
            logger.error(f"Failed to load YOLO model: {e}")
            raise
        
        # Tracking for counting
        self.track_history = {}
        self.next_track_id = 0
        
    def detect(self, frame: np.ndarray) -> List[Detection]:
        """
        Detect vehicles in a single frame
        
        Args:
            frame: Input image (BGR format from OpenCV)
            
        Returns:
            List of Detection objects
        """
        results = self.model(frame, verbose=False)[0]
        detections = []
        
        for box in results.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])
            
            # Filter for vehicle classes and confidence
            if class_id not in self.VEHICLE_CLASSES:
                continue
            if confidence < self.confidence_threshold:
                continue
            
            # Get bounding box
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            
            # Calculate center
            center_x = (x1 + x2) // 2
            center_y = (y1 + y2) // 2
            
            detection = Detection(
                class_name=self.VEHICLE_CLASSES[class_id],
                class_id=class_id,
                confidence=confidence,
                bbox=(x1, y1, x2, y2),
                center=(center_x, center_y)
            )
            detections.append(detection)
        
        return detections
    
    def analyze_traffic(self, frame: np.ndarray) -> TrafficAnalysis:
        """
        Perform full traffic analysis on a frame
        
        Args:
            frame: Input image
            
        Returns:
            TrafficAnalysis with counts and status
        """
        detections = self.detect(frame)
        
        # Count by class
        counts = {
            'car': 0,
            'motorcycle': 0,
            'bus': 0,
            'truck': 0,
        }
        
        total_confidence = 0.0
        for det in detections:
            if det.class_name in counts:
                counts[det.class_name] += 1
            total_confidence += det.confidence
        
        total = sum(counts.values())
        avg_conf = total_confidence / total if total > 0 else 0.0
        
        # Calculate density (vehicles per unit area)
        frame_area = frame.shape[0] * frame.shape[1]
        density = (total / frame_area) * 10000  # Normalize
        
        # Determine traffic status
        traffic_status = self._get_traffic_status(total)
        
        return TrafficAnalysis(
            total_vehicles=total,
            cars=counts['car'],
            bikes=counts['motorcycle'],
            buses=counts['bus'],
            trucks=counts['truck'],
            ambulances=0,  # Requires custom model
            fire_trucks=0,
            density=min(100, density * 10),  # Scale for display
            traffic_status=traffic_status,
            avg_confidence=avg_conf,
            detections=detections
        )
    
    def _get_traffic_status(self, vehicle_count: int) -> str:
        """Determine traffic status from vehicle count"""
        for status, (min_v, max_v) in self.DENSITY_THRESHOLDS.items():
            if min_v <= vehicle_count <= max_v:
                return status
        return 'CRITICAL'
    
    def draw_detections(
        self, 
        frame: np.ndarray, 
        detections: List[Detection],
        show_labels: bool = True,
        show_confidence: bool = True
    ) -> np.ndarray:
        """
        Draw detection boxes on frame
        
        Args:
            frame: Input image
            detections: List of detections
            show_labels: Whether to show class labels
            show_confidence: Whether to show confidence scores
            
        Returns:
            Annotated frame
        """
        annotated = frame.copy()
        
        # Color map for classes
        colors = {
            'car': (255, 0, 0),      # Blue
            'motorcycle': (0, 255, 255),  # Yellow
            'bus': (0, 165, 255),    # Orange
            'truck': (0, 0, 255),    # Red
        }
        
        for det in detections:
            x1, y1, x2, y2 = det.bbox
            color = colors.get(det.class_name, (0, 255, 0))
            
            # Draw bounding box
            cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
            
            # Draw label
            if show_labels or show_confidence:
                label_parts = []
                if show_labels:
                    label_parts.append(det.class_name.upper())
                if show_confidence:
                    label_parts.append(f"{det.confidence:.0%}")
                
                label = " ".join(label_parts)
                
                # Label background
                (w, h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
                cv2.rectangle(annotated, (x1, y1 - h - 8), (x1 + w + 4, y1), color, -1)
                cv2.putText(annotated, label, (x1 + 2, y1 - 4), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        return annotated
    
    def process_video(
        self, 
        video_path: str, 
        output_path: Optional[str] = None,
        skip_frames: int = 1
    ) -> List[TrafficAnalysis]:
        """
        Process video file for traffic analysis
        
        Args:
            video_path: Path to input video
            output_path: Optional path for annotated output video
            skip_frames: Process every N frames
            
        Returns:
            List of TrafficAnalysis for each processed frame
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Cannot open video: {video_path}")
        
        # Get video properties
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # Setup video writer if output requested
        writer = None
        if output_path:
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        analyses = []
        frame_idx = 0
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            if frame_idx % skip_frames == 0:
                # Analyze frame
                analysis = self.analyze_traffic(frame)
                analyses.append(analysis)
                
                # Write annotated frame
                if writer:
                    annotated = self.draw_detections(frame, analysis.detections)
                    writer.write(annotated)
            
            frame_idx += 1
            
            # Progress log
            if frame_idx % 100 == 0:
                logger.info(f"Processed {frame_idx}/{total_frames} frames")
        
        cap.release()
        if writer:
            writer.release()
        
        logger.info(f"Video processing complete: {len(analyses)} frames analyzed")
        return analyses


def create_demo_detector() -> VehicleDetector:
    """Create detector with default settings for demo"""
    return VehicleDetector(
        model_path='yolov8n.pt',  # Will download automatically
        confidence_threshold=0.4,
        device='cpu'
    )


if __name__ == "__main__":
    # Demo usage
    detector = create_demo_detector()
    
    # Test with webcam
    cap = cv2.VideoCapture(0)
    
    print("Starting traffic detection demo. Press 'q' to quit.")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        analysis = detector.analyze_traffic(frame)
        annotated = detector.draw_detections(frame, analysis.detections)
        
        # Add traffic info overlay
        info_text = [
            f"Vehicles: {analysis.total_vehicles}",
            f"Cars: {analysis.cars} | Bikes: {analysis.bikes}",
            f"Buses: {analysis.buses} | Trucks: {analysis.trucks}",
            f"Status: {analysis.traffic_status}",
            f"Density: {analysis.density:.1f}%",
            f"Confidence: {analysis.avg_confidence:.1%}",
        ]
        
        for i, text in enumerate(info_text):
            cv2.putText(annotated, text, (10, 30 + i * 25),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        cv2.imshow('TRAFFICX AI - Vehicle Detection', annotated)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()