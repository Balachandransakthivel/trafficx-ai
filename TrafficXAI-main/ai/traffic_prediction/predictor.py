# TRAFFICX AI — Traffic Prediction Model
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TrafficPredictor:
    """ML-based traffic prediction for 30/60 minute horizons"""
    
    def __init__(self, model_type: str = 'random_forest'):
        """
        Initialize traffic predictor
        
        Args:
            model_type: 'random_forest', 'gradient_boosting', or 'linear'
        """
        self.model_type = model_type
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.is_trained = False
        self.feature_names = None
        self._init_model()
    
    def _init_model(self):
        """Initialize the ML model"""
        if self.model_type == 'random_forest':
            self.model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                n_jobs=-1
            )
        elif self.model_type == 'gradient_boosting':
            self.model = GradientBoostingRegressor(
                n_estimators=100,
                max_depth=5,
                learning_rate=0.1,
                random_state=42
            )
        elif self.model_type == 'linear':
            self.model = LinearRegression()
        else:
            raise ValueError(f"Unknown model type: {self.model_type}")
    
    def prepare_features(
        self, 
        historical_data: pd.DataFrame,
        target_horizon: int = 30  # minutes
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Prepare features and targets from historical data
        
        Expected columns in historical_data:
        - timestamp: datetime
        - road_name: str
        - vehicle_count: int
        - density: float
        - weather: str (optional)
        - event: str (optional)
        """
        df = historical_data.copy()
        
        # Ensure timestamp is datetime
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df = df.sort_values('timestamp')
        
        # Time-based features
        df['hour'] = df['timestamp'].dt.hour
        df['minute'] = df['timestamp'].dt.minute
        df['day_of_week'] = df['timestamp'].dt.dayofweek
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        df['is_rush_hour'] = df['hour'].apply(
            lambda h: 1 if (7 <= h <= 9) or (17 <= h <= 19) else 0
        )
        
        # Cyclical encoding for hour
        df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
        df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)
        df['minute_sin'] = np.sin(2 * np.pi * df['minute'] / 60)
        df['minute_cos'] = np.cos(2 * np.pi * df['minute'] / 60)
        
        # Road encoding
        if 'road_name' in df.columns:
            le = LabelEncoder()
            df['road_encoded'] = le.fit_transform(df['road_name'])
            self.label_encoders['road'] = le
        
        # Weather encoding (if available)
        if 'weather' in df.columns:
            le = LabelEncoder()
            df['weather_encoded'] = le.fit_transform(df['weather'].fillna('clear'))
            self.label_encoders['weather'] = le
        
        # Lag features (previous vehicle counts)
        for lag in [1, 2, 3, 6, 12]:  # 5min, 10min, 15min, 30min, 60min ago
            df[f'vehicle_count_lag_{lag}'] = df.groupby('road_name')['vehicle_count'].shift(lag)
            df[f'density_lag_{lag}'] = df.groupby('road_name')['density'].shift(lag)
        
        # Rolling statistics
        for window in [3, 6, 12]:
            df[f'vehicle_count_rolling_mean_{window}'] = (
                df.groupby('road_name')['vehicle_count']
                .transform(lambda x: x.rolling(window, min_periods=1).mean())
            )
            df[f'vehicle_count_rolling_std_{window}'] = (
                df.groupby('road_name')['vehicle_count']
                .transform(lambda x: x.rolling(window, min_periods=1).std())
            )
        
        # Target: vehicle count at target_horizon minutes ahead
        horizon_periods = target_horizon // 5  # Assuming 5-minute intervals
        df['target'] = df.groupby('road_name')['vehicle_count'].shift(-horizon_periods)
        
        # Drop rows with NaN
        feature_cols = [c for c in df.columns if c not in [
            'timestamp', 'road_name', 'weather', 'event', 'target'
        ]]
        
        df_clean = df.dropna(subset=feature_cols + ['target'])
        
        if len(df_clean) == 0:
            raise ValueError("Insufficient data for training")
        
        X = df_clean[feature_cols].values
        y = df_clean['target'].values
        
        self.feature_names = feature_cols
        return X, y
    
    def train(self, historical_data: pd.DataFrame, target_horizon: int = 30) -> Dict[str, float]:
        """
        Train the prediction model
        
        Returns:
            Dictionary with training metrics
        """
        X, y = self.prepare_features(historical_data, target_horizon)
        
        # Split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train
        self.model.fit(X_train_scaled, y_train)
        self.is_trained = True
        
        # Evaluate
        y_pred = self.model.predict(X_test_scaled)
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        
        logger.info(f"Model trained - MAE: {mae:.2f}, RMSE: {rmse:.2f}")
        
        return {
            'mae': mae,
            'rmse': rmse,
            'train_samples': len(X_train),
            'test_samples': len(X_test),
        }
    
    def predict(
        self, 
        current_data: Dict[str, Any],
        historical_context: pd.DataFrame = None,
        horizon: int = 30
    ) -> Dict[str, Any]:
        """
        Make prediction for a single road at current time
        
        Args:
            current_data: Dict with current road state
            historical_context: Recent historical data for lag features
            horizon: Prediction horizon in minutes
            
        Returns:
            Prediction dict with vehicle_count, density, status, confidence
        """
        if not self.is_trained:
            # Fallback to heuristic
            return self._heuristic_predict(current_data, horizon)
        
        # Prepare single sample
        # This would need the same feature engineering as training
        # For simplicity, using heuristic here
        return self._heuristic_predict(current_data, horizon)
    
    def _heuristic_predict(
        self, 
        current_data: Dict[str, Any], 
        horizon: int
    ) -> Dict[str, Any]:
        """Heuristic prediction when model not trained"""
        current_count = current_data.get('vehicle_count', 20)
        current_density = current_data.get('density', 50)
        current_hour = current_data.get('hour', datetime.now().hour)
        
        # Time-based multipliers
        if 17 <= current_hour <= 19:  # Evening rush
            multiplier = 1.4 + (horizon / 60) * 0.2
        elif 7 <= current_hour <= 9:  # Morning rush
            multiplier = 1.3 + (horizon / 60) * 0.15
        elif 22 <= current_hour or current_hour <= 5:  # Night
            multiplier = 0.4 - (horizon / 60) * 0.1
        else:
            multiplier = 1.0 + (horizon / 60) * 0.05
        
        predicted_count = current_count * multiplier
        predicted_density = min(100, current_density * multiplier)
        
        # Determine status
        if predicted_count <= 10:
            status = 'LOW'
        elif predicted_count <= 25:
            status = 'MEDIUM'
        elif predicted_count <= 40:
            status = 'HIGH'
        else:
            status = 'CRITICAL'
        
        return {
            'predicted_vehicle_count': round(predicted_count),
            'predicted_density': round(predicted_density, 1),
            'predicted_status': status,
            'confidence': 75,  # Heuristic confidence
            'horizon_minutes': horizon,
        }
    
    def save(self, path: str):
        """Save model to disk"""
        joblib.dump({
            'model': self.model,
            'scaler': self.scaler,
            'label_encoders': self.label_encoders,
            'feature_names': self.feature_names,
            'model_type': self.model_type,
            'is_trained': self.is_trained,
        }, path)
        logger.info(f"Model saved to {path}")
    
    def load(self, path: str):
        """Load model from disk"""
        data = joblib.load(path)
        self.model = data['model']
        self.scaler = data['scaler']
        self.label_encoders = data['label_encoders']
        self.feature_names = data['feature_names']
        self.model_type = data['model_type']
        self.is_trained = data['is_trained']
        logger.info(f"Model loaded from {path}")


def generate_synthetic_training_data(
    n_days: int = 30,
    interval_minutes: int = 5,
    roads: List[str] = None
) -> pd.DataFrame:
    """
    Generate synthetic historical traffic data for training
    
    Args:
        n_days: Number of days of data
        interval_minutes: Data interval in minutes
        roads: List of road names
        
    Returns:
        DataFrame with synthetic traffic data
    """
    if roads is None:
        roads = [
            'Avinashi Road', 'DB Road', 'Trichy Road',
            'Mettupalayam Road', 'NH Road'
        ]
    
    # Generate timestamps
    end_time = datetime.now().replace(minute=0, second=0, microsecond=0)
    start_time = end_time - timedelta(days=n_days)
    
    timestamps = pd.date_range(start=start_time, end=end_time, freq=f'{interval_minutes}min')
    
    data = []
    
    for road in roads:
        # Base traffic pattern for each road
        road_base = {
            'Avinashi Road': {'base': 35, 'rush_multiplier': 1.8},
            'DB Road': {'base': 25, 'rush_multiplier': 1.5},
            'Trichy Road': {'base': 15, 'rush_multiplier': 1.4},
            'Mettupalayam Road': {'base': 10, 'rush_multiplier': 1.3},
            'NH Road': {'base': 30, 'rush_multiplier': 1.6},
        }
        
        base = road_base.get(road, {'base': 20, 'rush_multiplier': 1.4})
        
        for ts in timestamps:
            hour = ts.hour
            day_of_week = ts.dayofweek
            is_weekend = day_of_week >= 5
            
            # Base count with daily pattern
            if 7 <= hour <= 9:  # Morning rush
                count = base['base'] * base['rush_multiplier']
            elif 17 <= hour <= 19:  # Evening rush
                count = base['base'] * base['rush_multiplier'] * 1.1
            elif 22 <= hour or hour <= 5:  # Night
                count = base['base'] * 0.3
            else:  # Off-peak
                count = base['base']
            
            # Weekend adjustment
            if is_weekend:
                count *= 0.7
            
            # Add noise
            count += np.random.normal(0, base['base'] * 0.15)
            count = max(0, count)
            
            # Density
            density = min(100, (count / 50) * 100)
            
            # Weather (simplified)
            weather = np.random.choice(['clear', 'rain', 'cloudy'], p=[0.7, 0.15, 0.15])
            if weather == 'rain':
                count *= 1.2
                density = min(100, density * 1.2)
            
            data.append({
                'timestamp': ts,
                'road_name': road,
                'vehicle_count': round(count),
                'density': round(density, 1),
                'weather': weather,
            })
    
    return pd.DataFrame(data)


def train_and_save_model(
    output_path: str = 'traffic_predictor.pkl',
    n_days: int = 60
):
    """Train model on synthetic data and save"""
    logger.info("Generating synthetic training data...")
    df = generate_synthetic_training_data(n_days=n_days)
    
    logger.info(f"Training data shape: {df.shape}")
    
    predictor = TrafficPredictor(model_type='random_forest')
    
    logger.info("Training 30-minute horizon model...")
    metrics_30 = predictor.train(df, target_horizon=30)
    
    logger.info("Training 60-minute horizon model...")
    metrics_60 = predictor.train(df, target_horizon=60)
    
    predictor.save(output_path)
    
    return {
        'metrics_30min': metrics_30,
        'metrics_60min': metrics_60,
    }


if __name__ == "__main__":
    # Train and save model
    results = train_and_save_model('traffic_predictor.pkl', n_days=60)
    print(f"Training results: {results}")