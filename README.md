# rPPG Heart Rate Monitor

Real-time, camera-based heart rate estimation using remote photoplethysmography (rPPG). No wearable required — just a webcam.

---

## Architecture

```
Browser
  │
  ├── getUserMedia → webcam stream
  ├── MediaPipe Face Detection → face bounding box
  ├── Canvas extraction → forehead ROI → avg green channel per frame
  │
  └── POST /analyze (every 2s)
        │
        ▼
   FastAPI Backend
        │
        ├── Detrend → remove slow lighting drift
        ├── Butterworth bandpass filter (0.7–4 Hz)
        ├── FFT → dominant frequency
        ├── BPM = peak_freq × 60
        ├── Anomaly detection
        └── Quality label → response
```

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS        |
| Webcam     | Web `getUserMedia` API, Canvas      |
| Face detect| MediaPipe Tasks Vision (WASM)       |
| Charts     | Recharts                            |
| Backend    | Python, FastAPI, Uvicorn            |
| Signal DSP | NumPy, SciPy (butter, filtfilt)     |
| Deploy     | Docker Compose, nginx (frontend)    |

---

## Features

- Live BPM estimation updating every ~2 seconds
- Green channel waveform visualization
- Signal quality score: Poor / Fair / Good / Excellent
- Anomaly detection: out-of-range BPM, signal clipping, flat signal, low SNR
- Session history — auto-saved every 10s when signal quality ≥ 30%
- CSV export of session history
- Single-command Docker deployment

---

## Quick Start

### Without Docker

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# → http://localhost:8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### With Docker

```bash
docker compose up --build
# Frontend → http://localhost:5173
# Backend  → http://localhost:8000
```

---

## API Reference

### `POST /analyze`
Accepts a green channel time series, returns BPM and signal diagnostics.

**Request**
```json
{
  "green_signal": [128.4, 129.1, 127.8, ...],
  "fps": 30.0
}
```

**Response**
```json
{
  "bpm": 72.0,
  "confidence": 0.81,
  "quality": "excellent",
  "anomalies": []
}
```

Anomaly codes: `bpm_out_of_range`, `signal_clipping`, `flat_signal`, `low_snr`

### `GET /health`
Returns `{"status": "ok"}`.

### `POST /session`
Saves a reading snapshot. Returns the stored record with `id` and `timestamp`.

### `GET /sessions`
Returns all stored session records.

### `DELETE /sessions`
Clears all session history.

---

## rPPG Algorithm

1. **Face detection** — MediaPipe BlazeFace locates the face bounding box each frame
2. **ROI extraction** — top 35% of the bounding box (forehead) is used; forehead has stronger rPPG signal due to thinner skin and fewer hair/beard occlusions
3. **Green channel** — average pixel green value across the ROI per frame; green has the highest absorption contrast with hemoglobin
4. **Detrending** — removes slow drift from ambient light changes (scipy `detrend`)
5. **Bandpass filter** — 4th-order Butterworth, 0.7–4 Hz (42–240 BPM), applied with `filtfilt` for zero phase distortion
6. **FFT** — dominant frequency in the valid band → BPM = freq × 60
7. **Confidence** — ratio of peak power to total band power, scaled to [0, 1]

---

## Trade-offs

| Decision | Alternative | Reason chosen |
|---|---|---|
| Green channel only | POS / CHROM multi-channel | Simpler, still effective for demo; multi-channel needs raw RGB at same FPS |
| FFT peak | Peak-picking with harmonic check | Lower complexity; harmonic validation is a future improvement |
| In-memory session store | SQLite / PostgreSQL | No setup needed for demo; swap `_sessions` list for a DB in production |
| Browser-side face detection | Server-side OpenCV | Avoids sending full video frames to backend; lower latency, better privacy |
| 2s API polling | WebSocket streaming | Simpler for MVP; WebSocket would reduce latency to ~1s |

---

## Known Limitations

- **Lighting sensitivity** — fluorescent or flickering lights introduce 50/60 Hz noise that can alias into the heart rate band
- **Motion artefacts** — head movement causes step changes in the ROI green average; a motion rejection filter would improve robustness
- **Webcam quality** — low-end webcams with aggressive auto-exposure/auto-white-balance actively suppress the rPPG signal
- **Skin tone bias** — green channel absorption varies with melanin; multi-channel methods (POS, CHROM) are more robust across skin tones
- **Session persistence** — history is lost on backend restart; use a database for production

---

## Future Improvements

- **Better algorithm** — implement CHROM or POS rPPG for skin-tone robustness
- **Motion rejection** — detect and discard frames with excessive optical flow
- **WebSocket streaming** — push BPM updates as they're computed instead of polling
- **Mobile optimisation** — reduce canvas resolution on mobile, test MediaPipe WASM performance
- **Edge deployment** — compile signal processing to WASM to run fully in-browser
- **Database** — replace in-memory session list with SQLite for persistent history
- **HRV** — heart rate variability from inter-beat intervals for deeper health insight

---

## Project Description (for portfolio / job applications)

> Built a real-time camera-based heart rate estimation system using rPPG, integrating computer vision (MediaPipe), signal processing (bandpass filtering, FFT), and full-stack deployment (React + FastAPI + Docker).
