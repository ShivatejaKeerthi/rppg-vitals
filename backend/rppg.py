import numpy as np
from scipy.signal import butter, filtfilt, detrend


def bandpass_filter(signal: np.ndarray, lowcut: float, highcut: float, fs: float) -> np.ndarray:
    nyq = 0.5 * fs
    b, a = butter(4, [lowcut / nyq, highcut / nyq], btype="band")
    return filtfilt(b, a, signal)


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

    # Clipping: overexposed (>245) or underexposed (<10) pixels
    if float(np.mean((raw < 10) | (raw > 245))) > 0.05:
        flags.append("signal_clipping")

    # Flat signal: face ROI not producing useful variance
    if np.std(raw) < 1.0:
        flags.append("flat_signal")

    # Low SNR: dominant frequency barely stands out
    if confidence < 0.15:
        flags.append("low_snr")

    return flags


def compute_bpm(green_signal: list[float], fps: float = 30.0) -> dict:
    signal = np.array(green_signal, dtype=np.float64)
    min_samples = int(fps * 2)

    if len(signal) < min_samples:
        return {
            "bpm": None, "confidence": 0.0, "quality": "poor",
            "anomalies": [], "error": "Not enough data (need ~2s of frames)",
        }

    raw = signal.copy()
    signal = detrend(signal)

    try:
        filtered = bandpass_filter(signal, 0.7, 4.0, fps)
    except Exception:
        return {
            "bpm": None, "confidence": 0.0, "quality": "poor",
            "anomalies": [], "error": "Filter failed — check fps or signal length",
        }

    freqs = np.fft.rfftfreq(len(filtered), d=1.0 / fps)
    fft_mag = np.abs(np.fft.rfft(filtered))

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
