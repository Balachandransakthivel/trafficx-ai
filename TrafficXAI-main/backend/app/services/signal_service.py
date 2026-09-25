# TRAFFICX AI — Signal Service
from typing import Dict, Any, List
from datetime import datetime

from app.database.mongodb import get_database, COLLECTIONS
from app.models.traffic import SignalState
from app.api.signals import get_mock_signals


async def activate_green_corridor_signals(waypoints: List[str]) -> Dict[str, Any]:
    """
    Activate green corridor for a list of junction waypoints
    Sets signals along the route to GREEN, others to RED
    """
    db = get_database()
    
    # Define corridor junctions (junctions that should be GREEN)
    corridor_junctions = []
    for wp in waypoints:
        if wp.startswith("J"):
            junction_num = wp[1:] if wp[1:].isdigit() else wp[1]
            corridor_junctions.append(f"SIG{junction_num}")
    
    # Default corridor signals if not specified
    if not corridor_junctions:
        corridor_junctions = ["SIG1", "SIG2", "SIG3"]
    
    if db:
        # Update corridor signals to GREEN
        await db[COLLECTIONS["signals"]].update_many(
            {"id": {"$in": corridor_junctions}},
            {"$set": {"state": SignalState.GREEN, "green_corridor": True, "timestamp": datetime.utcnow()}}
        )
        
        # Update other signals to RED
        await db[COLLECTIONS["signals"]].update_many(
            {"id": {"$nin": corridor_junctions}},
            {"$set": {"state": SignalState.RED, "green_corridor": False, "timestamp": datetime.utcnow()}}
        )
        
        signals = await db[COLLECTIONS["signals"]].find().to_list(100)
    else:
        signals = get_mock_signals()
        for s in signals:
            if s["id"] in corridor_junctions:
                s["state"] = SignalState.GREEN
                s["green_corridor"] = True
            else:
                s["state"] = SignalState.RED
                s["green_corridor"] = False
            s["timestamp"] = datetime.utcnow()
    
    return {
        "message": "Green corridor activated",
        "corridor_junctions": corridor_junctions,
        "signals": signals
    }


async def deactivate_green_corridor() -> Dict[str, Any]:
    """Deactivate green corridor - return signals to normal operation"""
    db = get_database()
    
    if db:
        # Reset all signals to normal (alternating GREEN/RED/YELLOW)
        normal_states = [SignalState.GREEN, SignalState.YELLOW, SignalState.RED]
        signals = await db[COLLECTIONS["signals"]].find().to_list(100)
        
        for i, signal in enumerate(signals):
            signal["state"] = normal_states[i % 3]
            signal["green_corridor"] = False
            signal["timestamp"] = datetime.utcnow()
            await db[COLLECTIONS["signals"]].replace_one({"id": signal["id"]}, signal)
    else:
        signals = get_mock_signals()
        normal_states = [SignalState.GREEN, SignalState.YELLOW, SignalState.RED]
        for i, s in enumerate(signals):
            s["state"] = normal_states[i % 3]
            s["green_corridor"] = False
            s["timestamp"] = datetime.utcnow()
    
    return {
        "message": "Green corridor deactivated - signals returned to normal",
        "signals": signals
    }


async def get_signal_status(junction_id: str) -> Dict[str, Any]:
    """Get current signal status for a junction"""
    db = get_database()
    
    if db:
        signal = await db[COLLECTIONS["signals"]].find_one({"junction_id": junction_id})
        if not signal:
            raise ValueError(f"Signal {junction_id} not found")
        return signal
    else:
        signals = get_mock_signals()
        for s in signals:
            if s["junction_id"] == junction_id:
                return s
        raise ValueError(f"Signal {junction_id} not found")


async def set_signal_timing(signal_id: str, green_duration: int, yellow_duration: int, red_duration: int) -> Dict[str, Any]:
    """Set custom signal timing (for future enhancement)"""
    db = get_database()
    
    if db:
        signal = await db[COLLECTIONS["signals"]].find_one({"id": signal_id})
        if not signal:
            raise ValueError(f"Signal {signal_id} not found")
        
        signal["timing"] = {
            "green": green_duration,
            "yellow": yellow_duration,
            "red": red_duration
        }
        signal["timestamp"] = datetime.utcnow()
        await db[COLLECTIONS["signals"]].replace_one({"id": signal_id}, signal)
        
        return {"message": "Signal timing updated", "signal": signal}
    
    return {"message": "Signal timing updated (mock)"}


async def simulate_signal_cycle(signal_id: str) -> Dict[str, Any]:
    """Simulate a signal cycle for demo purposes"""
    states = [SignalState.GREEN, SignalState.YELLOW, SignalState.RED]
    current_index = 0
    
    # In a real implementation, this would be a continuous loop
    # For demo, just return the next state
    db = get_database()
    
    if db:
        signal = await db[COLLECTIONS["signals"]].find_one({"id": signal_id})
        if signal:
            current_state = signal["state"]
            try:
                current_index = states.index(current_state)
            except ValueError:
                current_index = 0
    
    next_state = states[(current_index + 1) % len(states)]
    
    if db and signal:
        signal["state"] = next_state
        signal["timestamp"] = datetime.utcnow()
        await db[COLLECTIONS["signals"]].replace_one({"id": signal_id}, signal)
    
    return {"signal_id": signal_id, "new_state": next_state}