# TRAFFICX AI — Signals API
from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime

from app.models.traffic import TrafficSignal, SignalState, COLLECTIONS
from app.database.mongodb import get_database
from app.websocket.manager import broadcast_signal_update
from app.services.signal_service import activate_green_corridor_signals, deactivate_green_corridor

router = APIRouter()


@router.get("/", response_model=List[TrafficSignal])
async def get_signals():
    db = get_database()
    if db is None:
        return get_mock_signals()
    signals = await db[COLLECTIONS["signals"]].find().to_list(100)
    return [TrafficSignal(**s) for s in signals]


@router.get("/{signal_id}", response_model=TrafficSignal)
async def get_signal(signal_id: str):
    db = get_database()
    if db is None:
        signals = get_mock_signals()
        for s in signals:
            if s.id == signal_id:
                return s
        raise HTTPException(status_code=404, detail="Signal not found")
    signal = await db[COLLECTIONS["signals"]].find_one({"id": signal_id})
    if not signal:
        raise HTTPException(status_code=404, detail="Signal not found")
    return TrafficSignal(**signal)


@router.put("/{signal_id}", response_model=TrafficSignal)
async def update_signal(signal_id: str, signal: TrafficSignal):
    db = get_database()
    if db is None:
        return signal
    signal.timestamp = datetime.utcnow()
    await db[COLLECTIONS["signals"]].replace_one({"id": signal_id}, signal.dict())
    await broadcast_signal_update({"type": "signal_updated", "data": signal.dict()})
    return signal


@router.post("/green-corridor/activate")
async def activate_green_corridor(route_waypoints: List[str]):
    """Activate green corridor for given waypoints"""
    result = await activate_green_corridor_signals(route_waypoints)
    await broadcast_signal_update({"type": "green_corridor_activated", "data": result})
    return result


@router.post("/green-corridor/deactivate")
async def deactivate_green_corridor_endpoint():
    """Deactivate green corridor - return all signals to normal"""
    result = await deactivate_green_corridor()
    await broadcast_signal_update({"type": "green_corridor_deactivated", "data": result})
    return result


@router.post("/{signal_id}/state")
async def set_signal_state(signal_id: str, state: SignalState):
    """Manually set signal state"""
    db = get_database()
    if db is None:
        return {"message": f"Signal {signal_id} set to {state} (mock)"}
    
    signal = await db[COLLECTIONS["signals"]].find_one({"id": signal_id})
    if not signal:
        raise HTTPException(status_code=404, detail="Signal not found")
    
    signal["state"] = state
    signal["timestamp"] = datetime.utcnow()
    await db[COLLECTIONS["signals"]].replace_one({"id": signal_id}, signal)
    
    await broadcast_signal_update({"type": "signal_state_changed", "data": signal})
    return {"message": f"Signal {signal_id} set to {state}", "signal": signal}


def get_mock_signals() -> List[TrafficSignal]:
    return [
        TrafficSignal(
            id="SIG1", junction_id="J1", junction_name="Junction 1 – Anna Nagar",
            state=SignalState.GREEN, green_corridor=True, vehicle_count=14,
            lat=11.0168, lng=77.0061,
        ),
        TrafficSignal(
            id="SIG2", junction_id="J2", junction_name="Junction 2 – RS Puram",
            state=SignalState.GREEN, green_corridor=True, vehicle_count=9,
            lat=11.0005, lng=76.9691,
        ),
        TrafficSignal(
            id="SIG3", junction_id="J3", junction_name="Junction 3 – Peelamedu",
            state=SignalState.GREEN, green_corridor=True, vehicle_count=22,
            lat=11.0104, lng=77.0432,
        ),
        TrafficSignal(
            id="SIG4", junction_id="J4", junction_name="Junction 4 – Ganapathy",
            state=SignalState.RED, green_corridor=False, vehicle_count=41,
            lat=10.9951, lng=77.0069,
        ),
        TrafficSignal(
            id="SIG5", junction_id="J5", junction_name="Junction 5 – Singanallur",
            state=SignalState.YELLOW, green_corridor=False, vehicle_count=17,
            lat=10.9752, lng=77.0330,
        ),
    ]