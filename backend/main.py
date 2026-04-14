from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os

from .database import engine, get_db, Base
from .models import Prediction
from .schemas import PredictRequest, PredictResponse, PredictionRecord
from .predictor import get_predictor, WeatherPredictor

# สร้าง tables อัตโนมัติ
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Weather Predictor API",
    description="Predict tomorrow's weather using ML models",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ตอน production เปลี่ยนเป็น domain จริง
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict", response_model=PredictResponse)
def predict(
    req: PredictRequest,
    db: Session = Depends(get_db),
    predictor: WeatherPredictor = Depends(get_predictor),
):
    try:
        result = predictor.predict(
            temperature_max=req.temperature_max,
            temperature_min=req.temperature_min,
            precipitation=req.precipitation,
            windspeed_max=req.windspeed_max,
            month=req.month,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")

    record = Prediction(
        temperature_max=req.temperature_max,
        temperature_min=req.temperature_min,
        precipitation=req.precipitation,
        windspeed_max=req.windspeed_max,
        month=req.month,
        predicted_temp_max=result.predicted_temp_max,
        will_rain=result.will_rain,
        rain_probability=result.rain_probability,
        note=req.note,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return record

@app.get("/history", response_model=List[PredictionRecord])
def get_history(
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    records = (
        db.query(Prediction)
        .order_by(Prediction.created_at.desc())
        .limit(limit)
        .all()
    )
    return records

@app.delete("/history/{prediction_id}")
def delete_prediction(prediction_id: int, db: Session = Depends(get_db)):
    record = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Prediction not found")
    db.delete(record)
    db.commit()
    return {"message": f"Prediction {prediction_id} deleted"}