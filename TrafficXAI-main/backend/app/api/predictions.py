# TRAFFICX AI — Predictions API
from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime

from app.models.traffic import TrafficPrediction, TrafficStatus, COLLECTIONS
from app.database.mongodb import get_database
from app.services.prediction_service import predict_traffic, get_predictions
from app.websocket.manager import broadcast_prediction_update

router = APIRouter()


@router.get("/", response_model=List[TrafficPrediction])
async def get_traffic_predictions():
    db = get_database()
    if db is None:
        return get_mock_predictions()
    predictions = await db[COLLECTIONS["predictions"]].find().to_list(100)
    return [TrafficPrediction(**p) for p in predictions]


@router.get("/{road_name}", response_model=TrafficPrediction)
async def get_road_prediction(road_name: str):
    db = get_database()
    if db is None:
        predictions = get_mock_predictions()
        for p in predictions:
            if p.road_name == road_name:
                return p
        raise HTTPException(status_code=404, detail="Prediction not found")
    prediction = await db[COLLECTIONS["predictions"]].find_one({"road_name": road_name})
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return TrafficPrediction(**prediction)


@router.post("/predict")
async def predict(
    road_name: str,
    current_status: TrafficStatus,
    historical_data: List[dict] = None
):
    """Generate traffic prediction for a road"""
    prediction = await predict_traffic(road_name, current_status, historical_data)
    
    db = get_database()
    if db:
        await db[COLLECTIONS["predictions"]].replace_one(
            {"road_name": road_name}, prediction.dict(), upsert=True
        )
    
    await broadcast_prediction_update({"type": "prediction_updated", "data": prediction.dict()})
    return prediction


@router.post("/batch-predict")
async def batch_predict(roads: List[dict]):
    """Generate predictions for multiple roads"""
    predictions = []
    for road in roads:
        pred = await predict_traffic(
            road["road_name"], 
            road["current_status"], 
            road.get("historical_data")
        )
        predictions.append(pred)
    
    db = get_database()
    if db:
        for pred in predictions:
            await db[COLLECTIONS["predictions"]].replace_one(
                {"road_name": pred.road_name}, pred.dict(), upsert=True
            )
    
    await broadcast_prediction_update({"type": "batch_prediction_updated", "data": [p.dict() for p in predictions]})
    return {"predictions": predictions}


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