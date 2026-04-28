from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
from rppg import compute_bpm, compute_brpm, compute_hrv

app = FastAPI(title="rPPG Heart Rate API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    green_signal: list[float] = Field(..., min_length=1, description="Average green channel values per frame")
    fps: float = Field(default=30.0, gt=0, description="Frames per second of the signal")


class AnalyzeResponse(BaseModel):
    bpm: Optional[float]
    confidence: float
    quality: str = "poor"
    anomalies: list[str] = []
    brpm: Optional[float] = None
    breathing_confidence: float = 0.0
    hrv_rmssd: Optional[float] = None
    stress_level: str = "unknown"
    stress_score: float = 0.0
    error: Optional[str] = None


_sessions: list[dict] = []


class SessionRecord(BaseModel):
    bpm: float
    confidence: float


class SessionResponse(BaseModel):
    id: int
    bpm: float
    confidence: float
    timestamp: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/session", response_model=SessionResponse, status_code=201)
def save_session(record: SessionRecord):
    session = {
        "id": len(_sessions) + 1,
        "bpm": record.bpm,
        "confidence": record.confidence,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    _sessions.append(session)
    return session


@app.get("/sessions", response_model=list[SessionResponse])
def get_sessions():
    return _sessions


@app.delete("/sessions")
def clear_sessions():
    _sessions.clear()
    return {"cleared": True}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):
    if len(req.green_signal) == 0:
        raise HTTPException(status_code=422, detail="green_signal must not be empty")

    result = compute_bpm(req.green_signal, fps=req.fps)
    result.update(compute_brpm(req.green_signal, fps=req.fps))
    result.update(compute_hrv(req.green_signal, fps=req.fps))
    return AnalyzeResponse(**result)
