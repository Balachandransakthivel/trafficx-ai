# TRAFFICX AI — WebSocket Manager
import socketio
from typing import Dict, Any
import asyncio

# Create Socket.IO server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins="*",
    logger=True,
    engineio_logger=True,
)

# ASGI app for FastAPI
sio_app = socketio.ASGIApp(sio)


# Store connected clients
connected_clients = set()


@sio.event
async def connect(sid, environ, auth):
    """Client connected"""
    connected_clients.add(sid)
    print(f"Client connected: {sid} (total: {len(connected_clients)})")
    
    # Send initial state
    await sio.emit("connected", {"client_id": sid, "message": "Connected to TRAFFICX AI"}, room=sid)


@sio.event
async def disconnect(sid):
    """Client disconnected"""
    connected_clients.discard(sid)
    print(f"Client disconnected: {sid} (total: {len(connected_clients)})")


@sio.event
async def subscribe(sid, data):
    """Subscribe to specific updates"""
    channels = data.get("channels", ["all"])
    # In a real implementation, store client subscriptions
    await sio.emit("subscribed", {"channels": channels}, room=sid)


@sio.event
async def unsubscribe(sid, data):
    """Unsubscribe from updates"""
    channels = data.get("channels", ["all"])
    await sio.emit("unsubscribed", {"channels": channels}, room=sid)


@sio.event
async def ping(sid):
    """Heartbeat"""
    await sio.emit("pong", {"timestamp": asyncio.get_event_loop().time()}, room=sid)


# Broadcast functions for real-time updates
async def broadcast_traffic_update(data: Dict[str, Any]):
    """Broadcast traffic update to all connected clients"""
    if connected_clients:
        await sio.emit("traffic_update", data)


async def broadcast_incident_update(data: Dict[str, Any]):
    """Broadcast incident update to all connected clients"""
    if connected_clients:
        await sio.emit("incident_update", data)


async def broadcast_emergency_update(data: Dict[str, Any]):
    """Broadcast emergency update to all connected clients"""
    if connected_clients:
        await sio.emit("emergency_update", data)


async def broadcast_signal_update(data: Dict[str, Any]):
    """Broadcast signal update to all connected clients"""
    if connected_clients:
        await sio.emit("signal_update", data)


async def broadcast_route_update(data: Dict[str, Any]):
    """Broadcast route update to all connected clients"""
    if connected_clients:
        await sio.emit("route_update", data)


async def broadcast_prediction_update(data: Dict[str, Any]):
    """Broadcast prediction update to all connected clients"""
    if connected_clients:
        await sio.emit("prediction_update", data)


async def broadcast_alert(data: Dict[str, Any]):
    """Broadcast alert to all connected clients"""
    if connected_clients:
        await sio.emit("alert", data)


async def broadcast_simulation_update(data: Dict[str, Any]):
    """Broadcast simulation state update"""
    if connected_clients:
        await sio.emit("simulation_update", data)


# Periodic broadcast for live simulation
async def start_live_updates():
    """Start periodic live updates for demo"""
    while True:
        await asyncio.sleep(5)  # Update every 5 seconds
        
        if connected_clients:
            # Simulate live traffic fluctuations
            await sio.emit("live_traffic", {
                "type": "heartbeat",
                "timestamp": datetime.utcnow().isoformat(),
                "connected_clients": len(connected_clients),
            })


from datetime import datetime