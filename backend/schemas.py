from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class PredictRequest(BaseModel):
    temperature_max: float = Field(..., ge=-50, le=60, description="Max temp today (°C)")
    temperature_min: float = Field(..., ge=-50, le=60, description="Min temp today (°C)")
    precipitation: float = Field(..., ge=0, description="Rainfall today (mm)")
    windspeed_max: float = Field(..., ge=0, description="Max wind speed (km/h)")
    month: int = Field(..., ge=1, le=12, description="Month (1-12)")
    note: Optional[str] = None

class PredictResponse(BaseModel):
    predicted_temp_max: float
    will_rain: bool
    rain_probability: float
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}

class PredictionRecord(BaseModel):
    id: int
    temperature_max: float
    temperature_min: float
    precipitation: float
    windspeed_max: float
    month: int
    predicted_temp_max: float
    will_rain: bool
    rain_probability: float
    created_at: datetime
    note: Optional[str]

    model_config = {"from_attributes": True}