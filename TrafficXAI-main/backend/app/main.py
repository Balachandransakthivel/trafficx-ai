# TRAFFICX AI — FastAPI Backend
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from app.api import traffic, emergency, incidents, routes, signals, predictions
from app.websocket.manager import sio_app
from app.database.mongodb import connect_to_mongo, close_mongo_connection


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()


app = FastAPI(
    title="TRAFFICX AI API",
    description="Smart Traffic & Emergency Response System",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS for mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Socket.IO
app.mount("/ws", sio_app)

# Include routers
app.include_router(traffic.router, prefix="/api/traffic", tags=["traffic"])
app.include_router(emergency.router, prefix="/api/emergency", tags=["emergency"])
app.include_router(incidents.router, prefix="/api/incidents", tags=["incidents"])
app.include_router(routes.router, prefix="/api/routes", tags=["routes"])
app.include_router(signals.router, prefix="/api/signals", tags=["signals"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["predictions"])


@app.get("/")
async def root():
    return {"message": "TRAFFICX AI API", "version": "1.0.0", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "trafficx-ai"}


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)