import joblib
import numpy as np
import os
from pathlib import Path
from dataclasses import dataclass

MODEL_DIR = Path(os.getenv("MODEL_DIR", "/app/models"))

@dataclass
class PredictionResult:
    predicted_temp_max: float
    will_rain: bool
    rain_probability: float

class WeatherPredictor:
    def __init__(self):
        self.temp_model = None
        self.rain_model = None
        self._load_models()

    def _load_models(self):
        try:
            self.temp_model = joblib.load(MODEL_DIR / "temp_model.pkl")
            self.rain_model = joblib.load(MODEL_DIR / "rain_model.pkl")
            print(f"✅ Models loaded from {MODEL_DIR}")
        except FileNotFoundError as e:
            print(f"⚠️ Models not found: {e}")
            raise RuntimeError(f"Model files not found in {MODEL_DIR}")

    def predict(
        self,
        temperature_max: float,
        temperature_min: float,
        precipitation: float,
        windspeed_max: float,
        month: int,
        # rolling features — ถ้าไม่มีข้อมูล 7 วัน ใช้ค่าวันนี้แทน
        temp_max_7d: float | None = None,
        precip_7d: float | None = None,
        rain_days_7d: float | None = None,
    ) -> PredictionResult:
        temp_range = temperature_max - temperature_min

        features = np.array([[
            temperature_max,
            temperature_min,
            precipitation,
            windspeed_max,
            temp_range,
            month,
            temp_max_7d if temp_max_7d is not None else temperature_max,
            precip_7d if precip_7d is not None else precipitation,
            rain_days_7d if rain_days_7d is not None else float(precipitation > 0),
        ]])

        temp_pred = float(self.temp_model.predict(features)[0])
        rain_pred = bool(self.rain_model.predict(features)[0])
        rain_prob = float(self.rain_model.predict_proba(features)[0][1])

        return PredictionResult(
            predicted_temp_max=round(temp_pred, 1),
            will_rain=rain_pred,
            rain_probability=round(rain_prob, 4),
        )

# Singleton
_predictor: WeatherPredictor | None = None

def get_predictor() -> WeatherPredictor:
    global _predictor
    if _predictor is None:
        _predictor = WeatherPredictor()
    return _predictor