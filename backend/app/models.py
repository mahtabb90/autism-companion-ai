from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class ChildProfile(Base):
    __tablename__ = "child_profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=True)
    interests = Column(Text, nullable=True)       # Free-text, e.g. "space, dinosaurs, trains"
    triggers = Column(Text, nullable=True)        # e.g. "loud noises, sudden changes"
    sensory_preferences = Column(Text, nullable=True)  # e.g. "soft lighting, no tags on clothes"
    calming_tools = Column(Text, nullable=True)   # e.g. "blue blanket, deep breaths"
    communication_style = Column(Text, nullable=True)  # e.g. "prefers visual cues, short sentences"
    notes = Column(Text, nullable=True)           # Any extra context for the parent
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

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

class Routine(Base):
    __tablename__ = "routines"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=True)  # e.g. "Morning", "Bedtime", "School"
    steps = Column(Text, nullable=False, default="[]")  # JSON string of step labels
    child_profile_id = Column(Integer, ForeignKey("child_profiles.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
