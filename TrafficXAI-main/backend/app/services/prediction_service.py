# TRAFFICX AI — Prediction Service
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import random
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler

from app.database.mongodb import get_database, COLLECTIONS
from app.models.traffic import TrafficPrediction, TrafficStatus
from app.api.traffic import get_mock_roads


# Simple ML model for traffic prediction
class TrafficPredictor:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=50, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
    
    def prepare_features(self, road_data: Dict, hour: int, day_of_week: int) -> List[float]:
        """Prepare features for prediction"""
        return [
            road_data.get("vehicle_count", 20),
            road_data.get("density", 50),
            hour,
            day_of_week,
            1 if road_data.get("status") == "CRITICAL" else 0,
            1 if road_data.get("status") == "HIGH" else 0,
            1 if road_data.get("status") == "MEDIUM" else 0,
        ]
    
    def train(self, historical_data: List[Dict]):
        """Train the model on historical data"""
        if len(historical_data) < 10:
            return
        
        X = []
        y = []
        for record in historical_data:
            road = record.get("road", {})
            X.append(self.prepare_features(
                road, 
                record.get("hour", 12), 
                record.get("day_of_week", 1)
            ))
            y.append(record.get("vehicle_count", 20))
        
        X = np.array(X)
        y = np.array(y)
        
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, y)
        self.is_trained = True
    
    def predict(self, road_data: Dict, hour: int, day_of_week: int) -> float:
        """Predict vehicle count for given time"""
        if not self.is_trained:
            # Fallback to simple heuristic
            base = road_data.get("vehicle_count", 20)
            # Add time-based variation
            if 17 <= hour <= 19:  # Rush hour
                return base * 1.5
            elif 7 <= hour <= 9:  # Morning rush
                return base * 1.3
            elif 22 <= hour or hour <= 5:  # Night
                return base * 0.3
            return base
        
        features = self.prepare_features(road_data, hour, day_of_week)
        features_scaled = self.scaler.transform([features])
        return max(0, self.model.predict(features_scaled)[0])


# Global predictor instance
predictor = TrafficPredictor()


async def predict_traffic(
    road_name: str,
    current_status: TrafficStatus,
    historical_data: List[Dict] = None
) -> TrafficPrediction:
    """Generate traffic prediction for a road"""
    
    # Get current road data
    db = get_database()
    if db:
        road = await db[COLLECTIONS["roads"]].find_one({"name": road_name})
    else:
        roads = get_mock_roads()
        road = next((r for r in roads if r.name == road_name), None)
    
    if not road:
        # Create default road data
        road = {
            "name": road_name,
            "vehicle_count": 20,
            "density": 40,
            "status": current_status.value,
        }
    
    # Train predictor if historical data provided
    if historical_data:
        predictor.train(historical_data)
    
    # Get current time
    now = datetime.utcnow()
    current_hour = now.hour
    day_of_week = now.weekday()
    
    # Predict for 30 min and 60 min
    pred_30min = predictor.predict(road, (current_hour + 1) % 24, day_of_week)
    pred_60min = predictor.predict(road, (current_hour + 2) % 24, day_of_week)
    
    # Convert predictions to status
    def count_to_status(count: float) -> TrafficStatus:
        if count <= 10:
            return TrafficStatus.LOW
        elif count <= 25:
            return TrafficStatus.MEDIUM
        elif count <= 40:
            return TrafficStatus.HIGH
        return TrafficStatus.CRITICAL
    
    prediction_30min = count_to_status(pred_30min)
    prediction_60min = count_to_status(pred_60min)
    
    # Calculate confidence (higher for nearer predictions)
    confidence = random.randint(75, 95)
    
    # Determine peak hour
    peak_hours = {
        "Avinashi Road": "5:30 PM",
        "Trichy Road": "6:00 PM",
        "DB Road": "4:45 PM",
        "Mettupalayam Road": "7:00 PM",
        "NH Road": "5:15 PM",
    }
    
    return TrafficPrediction(
        road_name=road_name,
        current_status=current_status,
        prediction_30min=prediction_30min,
        prediction_60min=prediction_60min,
        confidence=confidence,
        peak_hour=peak_hours.get(road_name, "5:00 PM"),
    )


async def get_predictions() -> List[TrafficPrediction]:
    """Get all current predictions"""
    db = get_database()
    if db is None:
        return get_mock_predictions()
    
    roads = await db[COLLECTIONS["roads"]].find().to_list(100)
    predictions = []
    
    for road in roads:
        pred = await predict_traffic(road["name"], TrafficStatus(road["status"]))
        predictions.append(pred)
    
    return predictions


def get_mock_predictions() -> List[TrafficPrediction]:
    return [
        TrafficPrediction(
            road_name="Avinashi Road",
            current_status=TrafficStatus.HIGH,
            prediction_30min=TrafficStatus.CRITICAL,
            prediction_60min=TrafficStatus.CRITICAL,
            confidence=87,
            peak_hour="5:30 PM",
        ),
        TrafficPrediction(
            road_name="Trichy Road",
            current_status=TrafficStatus.MEDIUM,
            prediction_30min=TrafficStatus.HIGH,
            prediction_60min=TrafficStatus.HIGH,
            confidence=79,
            peak_hour="6:00 PM",
        ),
        TrafficPrediction(
            road_name="DB Road",
            current_status=TrafficStatus.HIGH,
            prediction_30min=TrafficStatus.HIGH,
            prediction_60min=TrafficStatus.MEDIUM,
            confidence=82,
            peak_hour="4:45 PM",
        ),
        TrafficPrediction(
            road_name="Mettupalayam Road",
            current_status=TrafficStatus.LOW,
            prediction_30min=TrafficStatus.LOW,
            prediction_60min=TrafficStatus.MEDIUM,
            confidence=91,
            peak_hour="7:00 PM",
        ),
        TrafficPrediction(
            road_name="NH Road",
            current_status=TrafficStatus.HIGH,
            prediction_30min=TrafficStatus.CRITICAL,
            prediction_60min=TrafficStatus.HIGH,
            confidence=85,
            peak_hour="5:15 PM",
        ),
    ]


async def get_city_traffic_trend() -> List[Dict[str, Any]]:
    """Get predicted city-wide traffic trend for next 60 minutes"""
    now = datetime.utcnow()
    trend = []
    
    base_density = 50
    for i in range(7):  # Now, +10, +20, +30, +40, +50, +60 min
        minutes_ahead = i * 10
        hour = (now.hour + minutes_ahead // 60) % 24
        
        # Simulate traffic pattern
        if 17 <= hour <= 19:  # Evening rush
            density = min(95, base_density + 30 + i * 3)
        elif 7 <= hour <= 9:  # Morning rush
            density = min(90, base_density + 20 + i * 2)
        elif 22 <= hour or hour <= 5:  # Night
            density = max(10, base_density - 30 - i)
        else:
            density = base_density + random.randint(-5, 5) + i
        
        density = max(0, min(100, density))
        
        trend.append({
            "time": f"+{minutes_ahead}min" if i > 0 else "Now",
            "density": round(density),
            "status": "CRITICAL" if density >= 80 else "HIGH" if density >= 60 else "MEDIUM" if density >= 25 else "LOW",
        })
    
    return trend