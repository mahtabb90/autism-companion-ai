from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database

router = APIRouter(
    prefix="/situations",
    tags=["situations"]
)

@router.get("/", response_model=List[schemas.Situation])
def read_situations(db: Session = Depends(database.get_db)):
    return crud.get_situations(db)

@router.get("/{situation_id}", response_model=schemas.Situation)
def read_situation(situation_id: int, db: Session = Depends(database.get_db)):
    db_situation = crud.get_situation(db, situation_id=situation_id)
    if db_situation is None:
        raise HTTPException(status_code=404, detail="Situation not found")
    return db_situation

@router.post("/", response_model=schemas.Situation)
def create_situation(situation: schemas.SituationCreate, db: Session = Depends(database.get_db)):
    return crud.create_situation(db, situation_in=situation)
