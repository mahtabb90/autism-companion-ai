from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database

router = APIRouter(
    prefix="/emotions",
    tags=["emotions"]
)

@router.get("/", response_model=List[schemas.EmotionCheckIn])
def read_emotions(limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_emotions(db, limit=limit)

@router.post("/", response_model=schemas.EmotionCheckIn)
def create_emotion(emotion: schemas.EmotionCheckInCreate, db: Session = Depends(database.get_db)):
    return crud.create_emotion(db, emotion_in=emotion)
