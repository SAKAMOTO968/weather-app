from sqlalchemy import Column, Integer, Float, DateTime, Boolean, String
from sqlalchemy.sql import func
from .database import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    
    # Input features
    temperature_max = Column(Float, nullable=False)
    temperature_min = Column(Float, nullable=False)
    precipitation = Column(Float, nullable=False)
    windspeed_max = Column(Float, nullable=False)
    month = Column(Integer, nullable=False)
    
    # Predictions
    predicted_temp_max = Column(Float, nullable=False)
    will_rain = Column(Boolean, nullable=False)
    rain_probability = Column(Float, nullable=False)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    note = Column(String, nullable=True)