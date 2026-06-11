from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class EmotionCheckIn(Base):
    __tablename__ = "emotions"

    id = Column(Integer, primary_key=True, index=True)
    emotion = Column(String, nullable=False)  # e.g., "happy", "sad", "overwhelmed", "excited", "tired", "anxious"
    intensity = Column(Integer, default=1)   # 1, 2, or 3
    timestamp = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)

class Situation(Base):
    __tablename__ = "situations"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to stories
    stories = relationship("Story", back_populates="situation", cascade="all, delete-orphan")

class Story(Base):
    __tablename__ = "stories"

    id = Column(Integer, primary_key=True, index=True)
    situation_id = Column(Integer, ForeignKey("situations.id", ondelete="SET NULL"), nullable=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)  # Stored as JSON string
    generation_source = Column(String, nullable=True, default="fallback")
    created_at = Column(DateTime, default=datetime.utcnow)

    situation = relationship("Situation", back_populates="stories")
