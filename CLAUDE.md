# 🚀 Camera-Based Vital Signs Dashboard (rPPG Demo)

## 🎯 Goal

Build a full-stack web app that uses a webcam to estimate **heart rate (BPM)** in real time using **remote photoplethysmography (rPPG)**.

This project demonstrates:

* Computer vision integration
* Real-time signal processing
* Full-stack engineering
* Production-style thinking

---

## 🧠 High-Level Architecture

Frontend (React)

* Captures webcam video
* Extracts face region
* Sends signal/frame data to backend
* Displays heart rate + waveform

Backend (FastAPI or Node.js)

* Receives signal data
* Processes using rPPG algorithm
* Returns BPM + confidence

Optional:

* Database for session storage
* Dashboard for history

---

## 🛠️ Tech Stack

Frontend:

* React
* Tailwind CSS
* Web APIs (getUserMedia, Canvas)

Backend:

* Python (FastAPI) OR Node.js
* OpenCV / MediaPipe (face detection)
* NumPy / SciPy (signal processing)

Deployment:

* Vercel (frontend)
* Render / Railway (backend)

---

## 📦 Features (MVP)

### 1. Webcam Capture

* Access webcam using `navigator.mediaDevices.getUserMedia`
* Render video stream
* Extract frames at ~15–30 FPS

---

### 2. Face Detection

* Use MediaPipe or face-api.js
* Extract forehead/face ROI (region of interest)

---

### 3. rPPG Signal Extraction

* From ROI:

  * Extract green channel values over time
  * Store as time series

---

### 4. Signal Processing Pipeline

Implement:

* Detrending
* Bandpass filter (0.7–4 Hz)
* FFT (Fast Fourier Transform)
* Peak frequency → BPM

---

### 5. API Endpoints

POST /analyze

* Input: signal array or frame data
* Output:

```
{
  "bpm": number,
  "confidence": number
}
```

GET /health

* Returns server status

POST /session (optional)

* Store readings

---

### 6. Frontend Display

Show:

* Live BPM
* Signal waveform (chart)
* Confidence indicator

---

## ⚡ Implementation Plan

### Step 1: Backend

* Set up FastAPI server
* Implement `/analyze`
* Write basic rPPG function

### Step 2: Frontend

* Webcam capture
* Frame extraction
* API integration

### Step 3: Visualization

* Chart signal (use chart library)
* Display BPM in real time

---

## 🧪 rPPG Algorithm (Simplified)

1. Detect face
2. Extract ROI (forehead preferred)
3. Compute average green channel per frame
4. Build time series
5. Apply:

   * smoothing
   * bandpass filter
6. FFT → find dominant frequency
7. Convert to BPM:
   BPM = frequency * 60

---

## 🚧 Known Challenges

* Lighting conditions affect accuracy
* Motion introduces noise
* Webcam quality varies
* Latency vs accuracy trade-offs

---

## 🌟 Bonus Features (Pick 1–2)

* Signal quality score
* Session history dashboard
* Anomaly detection
* Export data (CSV)
* Docker deployment

---

## 🧠 Engineering Considerations

* Handle noisy input gracefully
* Avoid blocking UI (use async)
* Optimize frame rate vs performance
* Validate API inputs

---

## 📄 README Section (Important)

Include:

* Architecture diagram
* Tech decisions
* Trade-offs
* Limitations
* Future improvements:

  * Better models
  * Mobile optimization
  * Edge deployment

---

## 💬 Prompting Guide for Claude

Use Claude like a pair programmer:

* "Write a FastAPI endpoint for rPPG heart rate estimation"
* "Implement FFT-based BPM detection in Python"
* "React component for webcam streaming + frame capture"
* "Optimize signal filtering for noisy webcam input"

---

## ✅ Success Criteria

* Webcam captures video
* Face detected reliably
* BPM updates in near real-time
* UI displays usable feedback
* Backend processes signal correctly

---

## 🚀 Final Deliverable

* Working web app (live demo link)
* Clean GitHub repo
* Clear README
* Optional: short demo video

---

## 🧭 Positioning for Job Application

Describe this as:

"Built a real-time camera-based heart rate estimation system using rPPG, integrating computer vision, signal processing, and full-stack deployment."
