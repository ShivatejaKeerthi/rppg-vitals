import numpy as np


def _detrend(signal: np.ndarray) -> np.ndarray:
    """Remove linear trend via least-squares fit (replaces scipy.signal.detrend)."""
    x = np.arange(len(signal), dtype=np.float64)
    p = np.polyfit(x, signal, 1)
    return signal - np.polyval(p, x)


def quality_label(confidence: float) -> str:
    if confidence >= 0.6:
        return "excellent"
    if confidence >= 0.4:
        return "good"
    if confidence >= 0.2:
        return "fair"
    return "poor"


def detect_anomalies(raw: np.ndarray, bpm: float, confidence: float) -> list[str]:
    flags = []
    if bpm < 40 or bpm > 180:
        flags.append("bpm_out_of_range")
    if float(np.mean((raw < 10) | (raw > 245))) > 0.05:
        flags.append("signal_clipping")
    if np.std(raw) < 1.0:
        flags.append("flat_signal")
    if confidence < 0.15:
        flags.append("low_snr")
    return flags


def _find_peaks(signal: np.ndarray, min_distance: int) -> np.ndarray:
    """Local maxima with minimum distance constraint — no scipy needed."""
    kernel = np.ones(5) / 5
    smoothed = np.convolve(signal, kernel, mode="same")

    candidates = [
        i for i in range(1, len(smoothed) - 1)
        if smoothed[i] >= smoothed[i - 1] and smoothed[i] >= smoothed[i + 1]
    ]
    if not candidates:
        return np.array([])

    # Keep only the tallest peak within each min_distance window
    kept = [candidates[0]]
    for idx in candidates[1:]:
        if idx - kept[-1] >= min_distance:
            kept.append(idx)
        elif signal[idx] > signal[kept[-1]]:
            kept[-1] = idx
    return np.array(kept)


def compute_hrv(green_signal: list[float], fps: float = 30.0) -> dict:
    """
    RMSSD-based HRV from inter-beat intervals detected in the rPPG signal.
    Needs ~20s of data. RMSSD in ms: high = relaxed, low = stressed.
    """
    signal = np.array(green_signal, dtype=np.float64)
    if len(signal) < int(fps * 20):
        return {"hrv_rmssd": None, "stress_level": "unknown", "stress_score": 0.0}

    signal = _detrend(signal)
    std = np.std(signal)
    if std < 1e-9:
        return {"hrv_rmssd": None, "stress_level": "unknown", "stress_score": 0.0}
    signal = signal / std

    # Minimum peak distance = samples at 180 BPM max
    min_dist = max(int(fps * 60 / 180), 8)
    peaks = _find_peaks(signal, min_distance=min_dist)

    if len(peaks) < 4:
        return {"hrv_rmssd": None, "stress_level": "unknown", "stress_score": 0.0}

    # RR intervals in ms; filter to physiological range (40–180 BPM)
    rr = np.diff(peaks) / fps * 1000
    rr = rr[(rr >= 333) & (rr <= 1500)]

    if len(rr) < 3:
        return {"hrv_rmssd": None, "stress_level": "unknown", "stress_score": 0.0}

    rmssd = float(np.sqrt(np.mean(np.diff(rr) ** 2)))

    if rmssd >= 50:
        label, score = "relaxed",    0.10
    elif rmssd >= 35:
        label, score = "normal",     0.35
    elif rmssd >= 20:
        label, score = "elevated",   0.65
    else:
        label, score = "high stress", 0.90

    return {
        "hrv_rmssd":   round(rmssd, 1),
        "stress_level": label,
        "stress_score": round(score, 2),
    }


def compute_brpm(green_signal: list[float], fps: float = 30.0) -> dict:
    """Extract breathing rate from the low-frequency rPPG signal modulation (0.1–0.5 Hz)."""
    signal = np.array(green_signal, dtype=np.float64)
    min_samples = int(fps * 10)

    if len(signal) < min_samples:
        return {"brpm": None, "breathing_confidence": 0.0}

    signal = _detrend(signal)
    windowed = signal * np.hanning(len(signal))

    freqs = np.fft.rfftfreq(len(windowed), d=1.0 / fps)
    fft_mag = np.abs(np.fft.rfft(windowed))

    valid = (freqs >= 0.1) & (freqs <= 0.5)
    if not np.any(valid):
        return {"brpm": None, "breathing_confidence": 0.0}

    valid_freqs = freqs[valid]
    valid_mag = fft_mag[valid]
    peak_idx = np.argmax(valid_mag)
    brpm = float(valid_freqs[peak_idx] * 60)

    confidence = float(valid_mag[peak_idx] / (np.sum(valid_mag) + 1e-9))
    confidence = round(min(confidence * 3, 1.0), 3)

    return {"brpm": round(brpm, 1), "breathing_confidence": confidence}


def compute_bpm(green_signal: list[float], fps: float = 30.0) -> dict:
    signal = np.array(green_signal, dtype=np.float64)
    min_samples = int(fps * 2)

    if len(signal) < min_samples:
        return {
            "bpm": None, "confidence": 0.0, "quality": "poor",
            "anomalies": [], "error": "Not enough data (need ~2s of frames)",
        }

    raw = signal.copy()
    signal = _detrend(signal)

    # Hanning window reduces spectral leakage — standard in rPPG FFT pipelines
    windowed = signal * np.hanning(len(signal))

    freqs = np.fft.rfftfreq(len(windowed), d=1.0 / fps)
    fft_mag = np.abs(np.fft.rfft(windowed))

    valid = (freqs >= 0.7) & (freqs <= 4.0)
    if not np.any(valid):
        return {
            "bpm": None, "confidence": 0.0, "quality": "poor",
            "anomalies": [], "error": "No valid frequency bins",
        }

    valid_freqs = freqs[valid]
    valid_mag = fft_mag[valid]
    peak_idx = np.argmax(valid_mag)
    bpm = float(valid_freqs[peak_idx] * 60)

    confidence = float(valid_mag[peak_idx] / (np.sum(valid_mag) + 1e-9))
    confidence = round(min(confidence * 3, 1.0), 3)

    return {
        "bpm": round(bpm, 1),
        "confidence": confidence,
        "quality": quality_label(confidence),
        "anomalies": detect_anomalies(raw, bpm, confidence),
    }
